import { DemoRouter } from "@/demo/router";
export default async function Page({ params }: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await params;
  return <DemoRouter path={`/${path.join("/")}`} />;
}
