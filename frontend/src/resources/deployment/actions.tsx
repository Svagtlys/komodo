import { ActionWithDialog, ConfirmButton } from "@components/util";
import { Play, Trash, Pause, Rocket } from "lucide-react";
import { useExecute, useRead } from "@hooks";
import { DockerContainerState } from "@monitor/client/dist/types";
import { useNavigate } from "react-router-dom";

interface DeploymentId {
  deployment_id: string;
}

const RedeployContainer = ({ deployment_id }: DeploymentId) => {
  const { mutate, isLoading } = useExecute("Deploy");
  const deployments = useRead("ListDeployments", {}).data;
  const deployment = deployments?.find((d) => d.id === deployment_id);
  const deploying = useRead("GetDeploymentActionState", {
    id: deployment_id,
  }).data?.deploying;

  return (
    <ConfirmButton
      title={deployment?.info.status ? "Redeploy" : "Deploy"}
      intent="success"
      icon={<Rocket className="h-4 w-4" />}
      onClick={() => mutate({ deployment_id })}
      disabled={isLoading}
      loading={deploying}
    />
  );
};

const StartContainer = ({ deployment_id }: DeploymentId) => {
  const { data: d } = useRead("GetDeployment", { id: deployment_id });
  const { mutate, isLoading } = useExecute("StartContainer");
  const starting = useRead("GetDeploymentActionState", {
    id: deployment_id,
  }).data?.starting;

  if (!d) return null;
  return (
    <ActionWithDialog
      name={d.name}
      title="Start"
      intent="success"
      icon={<Play className="h-4 w-4" />}
      onClick={() => mutate({ deployment_id })}
      disabled={isLoading}
      loading={starting}
    />
  );
};

const StopContainer = ({ deployment_id }: DeploymentId) => {
  const { data: d } = useRead("GetDeployment", { id: deployment_id });
  const { mutate, isLoading } = useExecute("StopContainer");
  const stopping = useRead("GetDeploymentActionState", {
    id: deployment_id,
  }).data?.stopping;

  if (!d) return null;
  return (
    <ActionWithDialog
      name={d?.name}
      title="Stop"
      intent="warning"
      icon={<Pause className="h-4 w-4" />}
      onClick={() => mutate({ deployment_id })}
      disabled={isLoading}
      loading={stopping}
    />
  );
};

const StartOrStopContainer = ({ deployment_id }: DeploymentId) => {
  const deployments = useRead("ListDeployments", {}).data;
  const deployment = deployments?.find((d) => d.id === deployment_id);

  if (deployment?.info.state === DockerContainerState.NotDeployed) return null;

  if (deployment?.info.state === DockerContainerState.Running)
    return <StopContainer deployment_id={deployment_id} />;
  return <StartContainer deployment_id={deployment_id} />;
};

const RemoveContainer = ({ deployment_id }: DeploymentId) => {
  const deployment = useRead("GetDeployment", { id: deployment_id }).data;
  const { mutate, isLoading } = useExecute("RemoveContainer");

  const deployments = useRead("ListDeployments", {}).data;
  const state = deployments?.find((d) => d.id === deployment_id)?.info.state;

  const removing = useRead("GetDeploymentActionState", {
    id: deployment_id,
  }).data?.removing;

  if (!deployment) return null;
  if (state === DockerContainerState.NotDeployed) return null;

  return (
    <ActionWithDialog
      name={deployment.name}
      title="Remove"
      intent="warning"
      icon={<Trash className="h-4 w-4" />}
      onClick={() => mutate({ deployment_id })}
      disabled={isLoading}
      loading={removing}
    />
  );
};

export const DeleteDeployment = ({ id }: { id: string }) => {
  const nav = useNavigate();
  const { data: d } = useRead("GetDeployment", { id });
  const { mutateAsync, isLoading } = useExecute("RemoveContainer");

  const deleting = useRead("GetDeploymentActionState", { id }).data?.deleting;

  if (!d) return null;
  <ActionWithDialog
    name={d.name}
    title="Delete Deployment"
    intent="danger"
    icon={<Trash className="h-4 w-4" />}
    onClick={async () => {
      await mutateAsync({ deployment_id: id });
      nav("/");
    }}
    disabled={isLoading}
    loading={deleting}
  />;
};

export const DeploymentActions = ({ id }: { id: string }) => (
  <div className="flex gap-4">
    <RedeployContainer deployment_id={id} />
    <StartOrStopContainer deployment_id={id} />
    <RemoveContainer deployment_id={id} />
  </div>
);
