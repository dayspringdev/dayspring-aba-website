import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";

export const AuthSkeleton = () => (
  <div className="flex min-h-[80vh] w-full items-center justify-center bg-background/50">
    <Card className="w-full max-w-sm">
      <CardHeader>
        <Skeleton className="h-7 w-3/5" />
        <Skeleton className="h-5 w-4/5" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-9 w-full" />
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  </div>
);
