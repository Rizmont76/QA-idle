import type { CareerState } from "../../types";
import { STUDIO_RULES as S } from "./expansionData";
import { automaticPhases, projectPhase, projectThroughput } from "./studioSelectors";

export function advanceProject(s: CareerState, bugs: number): CareerState["project"] {
  let project = s.project;
  let work = bugs * projectThroughput(s);
  while (project) {
    const phase = projectPhase(project);
    if (!phase) {
      return null;
    }
    const applied = Math.min(work, Math.max(0, phase.target - project.progress));
    project = {
      ...project,
      progress: Math.min(phase.target, project.progress + applied),
    };
    work = Math.max(0, work - applied);
    if (
      project.progress < phase.target ||
      !automaticPhases(s) ||
      project.phase >= S.phases - 1
    ) {
      break;
    }
    project = { ...project, phase: project.phase + 1, progress: 0, elapsed: 0 };
  }
  return project;
}
