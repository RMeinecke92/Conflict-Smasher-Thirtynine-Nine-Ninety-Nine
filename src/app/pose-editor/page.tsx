import { PoseEditorApp } from "@/poseEditor/PoseEditorApp";

export const metadata = {
  title: "Pose Authoring Tool",
  description: "Author static stick-fighter skeleton poses as JSON for PD targets",
};

export default function PoseEditorPage() {
  return <PoseEditorApp />;
}
