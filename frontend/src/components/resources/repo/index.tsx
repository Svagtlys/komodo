import { useRead } from "@lib/hooks";
import { RequiredResourceComponents } from "@types";
import { Card, CardDescription, CardHeader, CardTitle } from "@ui/card";
import { FolderGit, GitBranch } from "lucide-react";
import { Link } from "react-router-dom";
import { RepoConfig } from "./config";
import { CloneRepo, PullRepo } from "./actions";
import { DeleteResource, NewResource } from "../common";
import { RepoTable } from "./table";
import { bg_color_class_by_intention, fill_color_class_by_intention, repo_status_intention } from "@lib/color";
import { cn } from "@lib/utils";

const useRepo = (id?: string) =>
  useRead("ListRepos", {}).data?.find((d) => d.id === id);

const RepoIcon = ({ id, size }: { id?: string; size: number }) => {
  const status = useRepo(id)?.info.status;
  const color = fill_color_class_by_intention(
    repo_status_intention(status)
  );
  return <GitBranch className={cn(`w-${size} h-${size}`, status && color)} />;
};

export const RepoComponents: RequiredResourceComponents = {
  Dashboard: () => {
    const repo_count = useRead("ListRepos", {}).data?.length;
    return (
      <Link to="/repos/" className="w-full">
        <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
          <CardHeader>
            <div className="flex justify-between">
              <div>
                <CardTitle>Repos</CardTitle>
                <CardDescription>{repo_count} Total</CardDescription>
              </div>
              <GitBranch className="w-4 h-4" />
            </div>
          </CardHeader>
        </Card>
      </Link>
    );
  },

  New: () => <NewResource type="Repo" />,

  Table: RepoTable,

  Name: ({ id }) => <>{useRepo(id)?.name}</>,
  name: (id) => useRepo(id)?.name,

  Icon: ({ id }) => <RepoIcon id={id} size={4} />,
  BigIcon: ({ id }) => <RepoIcon id={id} size={8} />,

  Status: {
    Status: ({ id }) => {
      let status = useRepo(id)?.info.status;
      const color = bg_color_class_by_intention(repo_status_intention(status));
      return (
        <Card className={cn("w-fit", color)}>
          <CardHeader className="py-0 px-2">{status}</CardHeader>
        </Card>
      );
    },
  },

  Info: {
    Repo: ({ id }) => {
      const repo = useRepo(id)?.info.repo;
      return (
        <div className="flex items-center gap-2">
          <FolderGit className="w-4 h-4" />
          {repo}
        </div>
      );
    },
    Branch: ({ id }) => {
      const branch = useRepo(id)?.info.branch;
      return (
        <div className="flex items-center gap-2">
          <FolderGit className="w-4 h-4" />
          {branch}
        </div>
      );
    },
  },

  Actions: { PullRepo, CloneRepo },

  Page: {},

  Config: RepoConfig,

  DangerZone: ({ id }) => <DeleteResource type="Repo" id={id} />,
};
