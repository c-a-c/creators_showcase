import { getProjectList } from "@/lib/data/data";
import ProjectList from "@/components/ProjectList";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await getProjectList();
  return (
    <div>
      <ProjectList projects={projects} />
    </div>
  );
}