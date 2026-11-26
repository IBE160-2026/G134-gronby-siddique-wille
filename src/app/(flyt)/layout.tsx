import { Flytskall } from "@/klient/skall/flytskall";

/** Felles layout for stegene etter Start (CAP-4). */
export default function FlytLayout({ children }: LayoutProps<"/">) {
  return <Flytskall>{children}</Flytskall>;
}
