import {
  Conversion,
  DockerBuildArgs,
  DockerRunArgs,
  EnvironmentVar,
  Volume,
} from "@monitor/types";
import { execute } from "./execute";
import { objFrom2Arrays } from "./helpers";
import Dockerode from "dockerode";

export async function prune() {
  const command = "docker image prune -a -f";
  return {
    command,
    ...(await execute(command)),
  };
}

/* Container */

export async function allContainerStatus(dockerode: Dockerode) {
  const statusAr = await dockerode.listContainers({ all: true });
  const statusNames = statusAr.map((stat) =>
    stat.Names[0].slice(1, stat.Names[0].length)
  ); // they all start with '/'
  return objFrom2Arrays(
    statusNames,
    statusAr.map((stat, i) => ({
      name: statusNames[i],
      Status: stat.Status,
      State: stat.State,
    }))
  );
}

export async function getContainerStatus(dockerode: Dockerode, name: string) {
  const status = (await dockerode.listContainers({ all: true })).filter(
    ({ Names }) => Names[0] === "/" + name
  );
  return status[0]
    ? {
        State: status[0].State,
        Status: status[0].Status,
        name,
      }
    : "not created";
}

export async function getContainerLog(containerName: string, logTail?: number) {
  return (
    await execute(
      `docker logs ${containerName}${logTail ? ` --tail ${logTail}` : ""}`
    )
  ).log;
}


export async function startContainer(containerName: string) {
  const command = `docker start ${containerName}`;
  return {
    command,
    ...(await execute(command)),
  };
}

export async function stopContainer(containerName: string) {
  const command = `docker stop ${containerName}`;
  return {
    command,
    ...(await execute(command)),
  };
}

export async function deleteContainer(containerName: string) {
  const command = `docker stop ${containerName} && docker container rm ${containerName}`;
  return {
    command,
    ...(await execute(command)),
  };
}

/* Docker Build */

export async function dockerBuild(
  { buildPath, dockerfilePath, imageName }: DockerBuildArgs,
  repoPath: string,
  registryUrl: string
) {
  const command = `cd ${repoPath}${imageName}${
    buildPath && (buildPath[0] === "/" ? buildPath : "/" + buildPath)
  } && docker build -t ${
    registryUrl + imageName
  } -f ${dockerfilePath} . && docker push ${registryUrl + imageName}`;
  return {
    command,
    ...(await execute(command)),
  };
}

/* Docker Run */

export async function dockerRun(
  {
    image,
    latest,
    ports,
    environment,
    network,
    volumes,
    restart,
    postImage,
    containerName,
    containerUser,
  }: DockerRunArgs,
  sysRoot: string,
  repoMount?: { repoFolder: string; containerMount: string }
) {
  const command =
    `docker pull ${image}${latest && ":latest"} && docker run -d` +
    name(containerName) +
    containerUserString(containerUser) +
    portsString(ports) +
    volsString(containerName!, sysRoot, volumes) +
    repoVolume(containerName, repoMount) +
    envString(environment) +
    restartString(restart) +
    networkString(network) +
    ` ${image}${latest && ":latest"}${postImage && " " + postImage}`;

  return {
    command,
    ...(await execute(command)),
  };
}

function name(containerName?: string) {
  return containerName && ` --name ${containerName}`;
}

function portsString(ports?: Conversion[]) {
  return ports && ports.length > 0
    ? ports
        .map(({ local, container }) => ` -p ${local}:${container}`)
        .reduce((prev, curr) => prev + curr)
    : "";
}

function volsString(folderName: string, sysRoot: string, volumes?: Volume[]) {
  return volumes && volumes.length > 0
    ? volumes
        .map(({ local, container, useSystemRoot }) => {
          const mid = !useSystemRoot && `${folderName}/`;
          const localString =
            local.length > 0
              ? local[0] === "/"
                ? local.slice(1, local.length)
                : local
              : "";
          return ` -v ${sysRoot + mid + localString}:${container}`;
        })
        .reduce((prev, curr) => prev + curr)
    : "";
}

function repoVolume(
  containerName?: string,
  repoMount?: { repoFolder: string; containerMount: string }
) {
  // repo root should be SYSROOT + "repos/"
  return (
    repoMount &&
    ` -v ${repoMount.repoFolder + containerName}:${repoMount.containerMount}`
  );
}

function restartString(restart?: string) {
  return restart
    ? ` --restart=${restart}${restart === "on-failure" ? ":10" : ""}`
    : "";
}

function envString(environment?: EnvironmentVar[]) {
  return environment && environment.length > 0
    ? environment
        .map(({ variable, value }) => ` -e "${variable}=${value}"`)
        .reduce((prev, curr) => prev + curr)
    : "";
}

function networkString(network?: string) {
  return network ? ` --network=${network}` : "";
}

function containerUserString(containerUser?: string) {
  return containerUser && containerUser.length > 0
    ? ` -u ${containerUser}`
    : "";
}
