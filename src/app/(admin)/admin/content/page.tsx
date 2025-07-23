import { ContentEditor } from "@/components/admin/ContentEditor";

export default function ContentPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Homepage Content</h1>
      <p className="text-muted-foreground">
        Edit the text and content that appears on your public homepage. Changes
        may take up to a minute to appear live due to caching.
      </p>
      <ContentEditor />
    </div>
  );
}
