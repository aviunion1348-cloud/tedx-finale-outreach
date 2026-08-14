import { getAllSpeakers } from "@/lib/data";
import HomeView from "@/components/field/HomeView";

export default function HomePage() {
  const speakers = getAllSpeakers();
  return <HomeView speakers={speakers} />;
}
