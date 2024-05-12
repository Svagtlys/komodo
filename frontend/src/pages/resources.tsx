import { Page } from "@components/layouts";
import { ResourceComponents } from "@components/resources";
import { TagsFilter } from "@components/tags";
import { useResourceParamType, useSetTitle } from "@lib/hooks";
import { Input } from "@ui/input";
import { useState } from "react";

export const Resources = () => {
  const type = useResourceParamType()!;
  const name = type === "ServerTemplate" ? "Server Template" : type;
  useSetTitle(name + "s");
  const Components = ResourceComponents[type];
  const [search, set] = useState("");

  return (
    <Page
      title={`${name}s`}
      icon={<Components.BigIcon />}
      actions={
        <div className="grid gap-4 justify-items-end">
          <div className="flex gap-4">
            <TagsFilter />
            <Components.New />
          </div>
          <Input
            value={search}
            onChange={(e) => set(e.target.value)}
            placeholder="search..."
            className="w-96"
          />
        </div>
      }
    >
      <Components.Table search={search} />
    </Page>
  );
};
