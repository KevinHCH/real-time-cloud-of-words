import MaxWidthWrapper from "@/components/MaxWidthWrapper"
import TopicCreator from "@/components/TopicCreator"
import { Icons } from "@/components/Icons"
import { Star } from "lucide-react"
import { redis } from "@/lib/redis"

export default async function Home() {
  const servedRequests = await redis.get("served-requests")
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <MaxWidthWrapper className="relative pb-24 pt-10 sm:pb-32 lg:pt-24 xl:pt-32 lg:pb-52">
        <div className="hidden lg:block absolute inset-0 top-8">
          {/**circle content */}
        </div>
        <div className="px-6 lg:px-0 lg:pt-4">
          <div className="relative mx-auto text-center flex flex-col items-center">
            <h1 className="relative leading-snug tracking-tight text-balance mt-16 font-bold text-gray-900 md:text-5xl">
              What do you <span className="whitespace-nowrap">think</span> about
              this...
            </h1>

            <TopicCreator />
            <div className="mt-12 flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div className="flex flex-col gap-1 justify-between items-center">
                <div className="flex gap-0.5 items-center">
                  <Star className="h-4 w-4 text-green-600 fill-green-600" />
                  <Star className="h-4 w-4 text-green-600 fill-green-600" />
                  <Star className="h-4 w-4 text-green-600 fill-green-600" />
                  <Star className="h-4 w-4 text-green-600 fill-green-600" />
                  <Star className="h-4 w-4 text-green-600 fill-green-600" />
                </div>
                <p>
                  <span className="font-semibold">
                    {Math.ceil(Number(servedRequests) / 10) * 10}
                  </span>{" "}
                  served requests
                </p>
              </div>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </main>
  )
}
