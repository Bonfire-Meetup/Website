import "server-only";

import { getHiddenGems } from "@/lib/recordings/hidden-gems";
import { getHotRecordingsSafe } from "@/lib/recordings/hot-picks";
import { LIBRARY_SHELVES, type LibraryShelf } from "@/lib/recordings/library-filter";
import { getMemberPicksSafe } from "@/lib/recordings/member-picks";

export interface LibraryShelfOrders {
  hiddenGemOrder: string[] | null;
  hotOrder: string[] | null;
  memberPickOrder: string[] | null;
}

export async function getLibraryShelfOrders(
  activeShelf: LibraryShelf,
): Promise<LibraryShelfOrders> {
  const [memberPickOrder, hotOrder, hiddenGemOrder] = await Promise.all([
    activeShelf === LIBRARY_SHELVES.MEMBER_PICKS
      ? getMemberPicksSafe(60).then((items) => items.map((item) => item.shortId))
      : Promise.resolve(null),
    activeShelf === LIBRARY_SHELVES.HOT
      ? getHotRecordingsSafe(60).then((items) => items.map((item) => item.shortId))
      : Promise.resolve(null),
    activeShelf === LIBRARY_SHELVES.HIDDEN_GEMS
      ? getHiddenGems(60).then((items) => items.map((item) => item.shortId))
      : Promise.resolve(null),
  ]);

  return { hiddenGemOrder, hotOrder, memberPickOrder };
}
