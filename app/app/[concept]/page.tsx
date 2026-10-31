import MenuPage from "@/components/customer-app/MenuPage";
import { CONCEPTS } from "@/lib/constants";

type PageProps = { params: Promise<{ concept: string }> };

export function generateStaticParams() {
  return CONCEPTS.map((c) => ({ concept: c.id }));
}

export default async function ConceptMenuPage({ params }: PageProps) {
  const { concept } = await params;
  return <MenuPage concept={concept} />;
}
