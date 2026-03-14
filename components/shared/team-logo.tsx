import Image from 'next/image';

export function TeamLogo({ src, alt }: { src?: string | null; alt: string }) {
  if (!src) {
    return <div className="h-10 w-10 rounded-full bg-slate-200" aria-label={alt} />;
  }
  return <Image src={src} alt={alt} width={40} height={40} className="h-10 w-10 rounded-full object-cover" />;
}
