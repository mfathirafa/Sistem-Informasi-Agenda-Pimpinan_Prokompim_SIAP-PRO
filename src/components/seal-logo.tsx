import Image from "next/image";

export default function SealLogo({
  size = 64,
}: {
  size?: number;
}) {
  return (
    <Image
      src="/logo.png"
      alt="Logo Kabupaten Brebes"
      width={size}
      height={size}
      priority
    />
  );
}