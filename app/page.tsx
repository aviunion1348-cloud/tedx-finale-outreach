// Orbital — cinematic space-travel landing page.
// Serves the static cinematic page as the home route (replaces prior UI).
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/space-travel.html");
}
