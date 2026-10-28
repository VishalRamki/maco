import { platforms } from "@/platforms";

interface TileEmbedProps {
  url: string;
  platform: string;
  title?: string;
}

export function TileEmbed({ url, platform, title }: TileEmbedProps) {
  const platformDef = platforms[platform];

  if (!platformDef || !platformDef.EmbedComponent) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground p-4">
        Unsupported platform: {platform}
      </div>
    );
  }

  const { EmbedComponent } = platformDef;
  return <EmbedComponent url={url} title={title} />;
}
