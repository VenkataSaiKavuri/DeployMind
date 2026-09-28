interface AnalysisPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AnalysisPage({
  params,
}: AnalysisPageProps) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-8">
          <p className="text-sm text-zinc-500">
            DeployMind
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Deployment Created
          </h1>

          <div className="mt-8 space-y-5">
            <div>
              <p className="text-sm text-zinc-500">
                Deployment ID
              </p>

              <p className="mt-1 text-lg font-medium">
                {id}
              </p>
            </div>

            <div>
              <p className="text-sm text-zinc-500">
                Status
              </p>

              <p className="mt-1 text-lg font-medium">
                Pending Analysis
              </p>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
              <p className="text-sm text-zinc-400">
                Risk analysis will be available in the next phase.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}