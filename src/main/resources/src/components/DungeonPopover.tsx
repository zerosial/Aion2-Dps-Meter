import { useState, useEffect } from "react";
import { Backpack } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export const DungeonPopover = () => {
  const [data, setData] = useState<any>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      try {
        const result = (window as any).javaBridge?.getDungeonData();
        if (result) {
          setData(JSON.parse(result));
        }
      } catch (e) {
        console.error("Failed to fetch dungeon data", e);
      }
    }
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full relative">
          <Backpack className="size-4.5" />
          {data && (data.dungeon > 0 || data.ode > 0) && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-green-500"></span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4 text-sm" align="end">
        <div className="flex flex-col gap-2">
          <div className="font-bold border-b pb-2 mb-2">자원 및 던전 현황</div>
          {data ? (
            <>
              <div className="flex justify-between">
                <span>캐릭터명:</span>
                <span className="font-medium">{data.username || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span>오드:</span>
                <span className="font-medium">{data.ode || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>초월 횟수:</span>
                <span className="font-medium">{data.transcend || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>던전 횟수:</span>
                <span className="font-medium">{data.dungeon || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>던전보스 처치:</span>
                <span className="font-medium">{data.dungeonBoss || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>초월보스 처치:</span>
                <span className="font-medium">{data.transcendBoss || 0}</span>
              </div>
              {data.lastUpdated > 0 && (
                <div className="text-xs text-muted-foreground mt-2 text-right">
                  업데이트: {new Date(data.lastUpdated).toLocaleTimeString()}
                </div>
              )}
            </>
          ) : (
            <div className="text-muted-foreground text-center py-4">
              데이터를 불러오는 중이거나<br/>아직 수집된 정보가 없습니다.
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
