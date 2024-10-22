import { Skeleton } from "../ui/skeleton";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";

const ITEMS_PER_PAGE: number = Number(process.env.ITEMS_PER_PAGE || 9);
function LoadingSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array(ITEMS_PER_PAGE)
                .fill(0)
                .map((_, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-6 w-20" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center mb-2">
                                <Skeleton className="h-4 w-4 mr-2" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                            <div className="flex items-center mb-2">
                                <Skeleton className="h-4 w-4 mr-2" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end space-x-2">
                            <Skeleton className="h-8 w-20" />
                            <Skeleton className="h-8 w-20" />
                        </CardFooter>
                    </Card>
                ))}
        </div>
    );
}
export default LoadingSkeleton;
