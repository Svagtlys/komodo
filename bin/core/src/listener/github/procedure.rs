use std::sync::OnceLock;

use anyhow::anyhow;
use axum::http::HeaderMap;
use komodo_client::{
  api::execute::RunProcedure,
  entities::{procedure::Procedure, user::git_webhook_user},
};
use reqwest::StatusCode;
use resolver_api::Resolve;
use serror::AddStatusCode;

use crate::{
  api::execute::ExecuteRequest,
  helpers::update::init_execution_update, resource, state::State,
};

use super::{extract_branch, verify_gh_signature, ListenerLockCache};

fn procedure_locks() -> &'static ListenerLockCache {
  static BUILD_LOCKS: OnceLock<ListenerLockCache> = OnceLock::new();
  BUILD_LOCKS.get_or_init(Default::default)
}

pub async fn auth_procedure_webhook(
  procedure_id: &str,
  headers: HeaderMap,
  body: &str,
) -> serror::Result<Procedure> {
  let procedure = resource::get::<Procedure>(procedure_id)
    .await
    .status_code(StatusCode::NOT_FOUND)?;
  verify_gh_signature(
    headers,
    body,
    &procedure.config.webhook_secret,
  )
  .await
  .status_code(StatusCode::UNAUTHORIZED)?;
  Ok(procedure)
}

pub async fn handle_procedure_webhook(
  procedure: Procedure,
  target_branch: String,
  body: String,
) -> anyhow::Result<()> {
  // Acquire and hold lock to make a task queue for
  // subsequent listener calls on same resource.
  // It would fail if we let it go through from action state busy.
  let lock =
    procedure_locks().get_or_insert_default(&procedure.id).await;
  let _lock = lock.lock().await;

  if !procedure.config.webhook_enabled {
    return Err(anyhow!("procedure does not have webhook enabled"));
  }

  let request_branch = extract_branch(&body)?;
  if request_branch != target_branch {
    return Err(anyhow!("request branch does not match expected"));
  }

  let user = git_webhook_user().to_owned();
  let req = ExecuteRequest::RunProcedure(RunProcedure {
    procedure: procedure.id,
  });
  let update = init_execution_update(&req, &user).await?;
  let ExecuteRequest::RunProcedure(req) = req else {
    unreachable!()
  };
  State.resolve(req, (user, update)).await?;
  Ok(())
}
