"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import {
    createDeployment,
    CreateDeploymentPayload,
} from "@/lib/api";

type Environment =
    | "development"
    | "staging"
    | "production";

type ConfigChange = {
    key: string;
    value: string;
};

export default function NewDeploymentPage() {
    const router = useRouter();

    // ==================================================
    // Deployment Details
    // ==================================================

    const [service, setService] = useState("");
    const [version, setVersion] = useState("");

    const [environment, setEnvironment] =
        useState<Environment>("production");

    const [developer, setDeveloper] = useState("");

    // ==================================================
    // Code Changes
    // ==================================================

    const [codeChanges, setCodeChanges] = useState<string[]>([
        "",
    ]);

    // ==================================================
    // Configuration Changes
    // ==================================================

    const [configChanges, setConfigChanges] =
        useState<ConfigChange[]>([
            {
                key: "",
                value: "",
            }, {
                key: "",
                value: "",
            },
        ]);

    // ==================================================
    // Infrastructure Changes
    // ==================================================

    const [infraChanges, setInfraChanges] = useState<string[]>([
        "",
    ]);

    // ==================================================
    // UI State
    // ==================================================

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // ==================================================
    // Demo Data
    // ==================================================

    function loadDemoData() {
        setService("payment-service");
        setVersion("v2.8.1");
        setEnvironment("production");
        setDeveloper("Kavuri");

        setCodeChanges([
            "Added payment retry handling",
            "Updated Redis client",
            "Modified timeout handling",
        ]);

        setConfigChanges([
            {
                key: "REDIS_TIMEOUT",
                value: "2000ms",
            },
            {
                key: "RETRY_COUNT",
                value: "5",
            },
        ]);

        setInfraChanges([
            "Redis 7.2 -> 7.4",
        ]);

        setError("");
    }

    // ==================================================
    // Code Change Functions
    // ==================================================

    function addCodeChange() {
        setCodeChanges((current) => [
            ...current,
            "",
        ]);
    }

    function removeCodeChange(index: number) {
        setCodeChanges((current) =>
            current.filter(
                (_, itemIndex) => itemIndex !== index
            )
        );
    }

    function updateCodeChange(
        index: number,
        value: string
    ) {
        setCodeChanges((current) =>
            current.map((item, itemIndex) =>
                itemIndex === index
                    ? value
                    : item
            )
        );
    }

    // ==================================================
    // Configuration Functions
    // ==================================================

    function addConfigChange() {
        setConfigChanges((current) => [
            ...current,
            {
                key: "",
                value: "",
            },
        ]);
    }

    function removeConfigChange(index: number) {
        setConfigChanges((current) =>
            current.filter(
                (_, itemIndex) => itemIndex !== index
            )
        );
    }

    function updateConfigKey(
        index: number,
        value: string
    ) {
        setConfigChanges((current) =>
            current.map((item, itemIndex) =>
                itemIndex === index
                    ? {
                        ...item,
                        key: value,
                    }
                    : item
            )
        );
    }

    function updateConfigValue(
        index: number,
        value: string
    ) {
        setConfigChanges((current) =>
            current.map((item, itemIndex) =>
                itemIndex === index
                    ? {
                        ...item,
                        value,
                    }
                    : item
            )
        );
    }

    // ==================================================
    // Infrastructure Functions
    // ==================================================

    function addInfraChange() {
        setInfraChanges((current) => [
            ...current,
            "",
        ]);
    }

    function removeInfraChange(index: number) {
        setInfraChanges((current) =>
            current.filter(
                (_, itemIndex) => itemIndex !== index
            )
        );
    }

    function updateInfraChange(
        index: number,
        value: string
    ) {
        setInfraChanges((current) =>
            current.map((item, itemIndex) =>
                itemIndex === index
                    ? value
                    : item
            )
        );
    }

    // ==================================================
    // Submit
    // ==================================================

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (loading) {
            return;
        }

        setError("");

        // -----------------------------------------------
        // Basic fields
        // -----------------------------------------------

        const cleanService = service.trim();
        const cleanVersion = version.trim();
        const cleanDeveloper = developer.trim();

        if (!cleanService) {
            setError("Service is required.");
            return;
        }

        if (!cleanVersion) {
            setError("Version is required.");
            return;
        }

        if (!cleanDeveloper) {
            setError("Developer is required.");
            return;
        }

        // -----------------------------------------------
        // Code changes
        // -----------------------------------------------

        const cleanCodeChanges = codeChanges
            .map((change) => change.trim())
            .filter(Boolean);

        // -----------------------------------------------
        // Infrastructure changes
        // -----------------------------------------------

        const cleanInfraChanges = infraChanges
            .map((change) => change.trim())
            .filter(Boolean);

        // -----------------------------------------------
        // Configuration changes
        // -----------------------------------------------

        const cleanConfigChanges: Record<
            string,
            string
        > = {};

        for (const item of configChanges) {
            const key = item.key.trim();
            const value = item.value.trim();

            if (key && value) {
                cleanConfigChanges[key] = value;
            }
        }

        // -----------------------------------------------
        // At least one change
        // -----------------------------------------------

        if (
            cleanCodeChanges.length === 0 &&
            Object.keys(cleanConfigChanges).length === 0 &&
            cleanInfraChanges.length === 0
        ) {
            setError(
                "Add at least one code, configuration, or infrastructure change."
            );

            return;
        }

        // -----------------------------------------------
        // Final payload
        // -----------------------------------------------

        const payload: CreateDeploymentPayload = {
            service: cleanService,
            version: cleanVersion,
            environment,
            developer: cleanDeveloper,
            code_changes: cleanCodeChanges,
            config_changes: cleanConfigChanges,
            infra_changes: cleanInfraChanges,
        };

        // -----------------------------------------------
        // Debug
        // -----------------------------------------------

        console.log(
            "DeployMind deployment payload:",
            JSON.stringify(payload, null, 2)
        );

        console.log(
            "DeployMind config_changes:",
            JSON.stringify(
                cleanConfigChanges,
                null,
                2
            )
        );

        // -----------------------------------------------
        // API request
        // -----------------------------------------------

        try {
            setLoading(true);

            const deployment =
                await createDeployment(payload);

            console.log(
                "Deployment created:",
                deployment
            );

            router.push(
                `/analysis/${deployment.id}`
            );
        } catch (err) {
            console.error(
                "Deployment creation failed:",
                err
            );

            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to create deployment."
            );
        } finally {
            setLoading(false);
        }
    }

    // ==================================================
    // UI
    // ==================================================

    return (
        <main className="min-h-screen bg-black px-6 py-10 text-white">
            <div className="mx-auto max-w-4xl">

                {/* ==================================================
            Header
        ================================================== */}

                <div className="mb-8">
                    <h1 className="text-3xl font-bold">
                        New Deployment
                    </h1>

                    <p className="mt-2 text-sm text-zinc-400">
                        Create a deployment for DeployMind to analyze.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >

                    {/* ==================================================
              Deployment Details
          ================================================== */}

                    <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">

                        <h2 className="text-lg font-semibold">
                            Deployment Details
                        </h2>

                        <div className="mt-5 grid gap-5 md:grid-cols-2">

                            {/* Service */}

                            <div>
                                <label className="mb-2 block text-sm text-zinc-300">
                                    Service
                                </label>

                                <input
                                    type="text"
                                    value={service}
                                    onChange={(event) =>
                                        setService(
                                            event.target.value
                                        )
                                    }
                                    placeholder="payment-service"
                                    disabled={loading}
                                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-zinc-400"
                                />
                            </div>

                            {/* Version */}

                            <div>
                                <label className="mb-2 block text-sm text-zinc-300">
                                    Version
                                </label>

                                <input
                                    type="text"
                                    value={version}
                                    onChange={(event) =>
                                        setVersion(
                                            event.target.value
                                        )
                                    }
                                    placeholder="v2.8.1"
                                    disabled={loading}
                                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-zinc-400"
                                />
                            </div>

                            {/* Environment */}

                            <div>
                                <label className="mb-2 block text-sm text-zinc-300">
                                    Environment
                                </label>

                                <select
                                    value={environment}
                                    onChange={(event) =>
                                        setEnvironment(
                                            event.target.value as Environment
                                        )
                                    }
                                    disabled={loading}
                                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm outline-none"
                                >
                                    <option value="development">
                                        development
                                    </option>

                                    <option value="staging">
                                        staging
                                    </option>

                                    <option value="production">
                                        production
                                    </option>
                                </select>
                            </div>

                            {/* Developer */}

                            <div>
                                <label className="mb-2 block text-sm text-zinc-300">
                                    Developer
                                </label>

                                <input
                                    type="text"
                                    value={developer}
                                    onChange={(event) =>
                                        setDeveloper(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Kavuri"
                                    disabled={loading}
                                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-zinc-400"
                                />
                            </div>

                        </div>
                    </section>

                    {/* ==================================================
              Code Changes
          ================================================== */}

                    <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">

                        <h2 className="text-lg font-semibold">
                            Code Changes
                        </h2>

                        <p className="mt-1 text-sm text-zinc-500">
                            Describe the code changes included in this deployment.
                        </p>

                        <div className="mt-5 space-y-3">

                            {codeChanges.map(
                                (change, index) => (
                                    <div
                                        key={index}
                                        className="flex gap-3"
                                    >

                                        <input
                                            type="text"
                                            value={change}
                                            onChange={(event) =>
                                                updateCodeChange(
                                                    index,
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Added payment retry handling"
                                            disabled={loading}
                                            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm outline-none"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeCodeChange(index)
                                            }
                                            disabled={loading}
                                            className="rounded-lg border border-zinc-700 px-4 text-sm text-zinc-400 hover:bg-zinc-800"
                                        >
                                            Remove
                                        </button>

                                    </div>
                                )
                            )}

                        </div>

                        <button
                            type="button"
                            onClick={addCodeChange}
                            disabled={loading}
                            className="mt-4 rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
                        >
                            + Add Code Change
                        </button>

                    </section>

                    {/* ==================================================
              Configuration Changes
          ================================================== */}

                    <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">

                        <h2 className="text-lg font-semibold">
                            Configuration Changes
                        </h2>

                        <p className="mt-1 text-sm text-zinc-500">
                            Add configuration values changed by this deployment.
                        </p>

                        <div className="mt-5 space-y-3">

                            {configChanges.map(
                                (item, index) => (
                                    <div
                                        key={index}
                                        className="grid gap-3 md:grid-cols-[1fr_1fr_auto]"
                                    >

                                        {/* Config Key */}

                                        <input
                                            type="text"
                                            value={item.key}
                                            onChange={(event) =>
                                                updateConfigKey(
                                                    index,
                                                    event.target.value
                                                )
                                            }
                                            placeholder="REDIS_TIMEOUT"
                                            disabled={loading}
                                            className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-zinc-400"
                                        />

                                        {/* Config Value */}

                                        <input
                                            type="text"
                                            value={item.value}
                                            onChange={(event) =>
                                                updateConfigValue(
                                                    index,
                                                    event.target.value
                                                )
                                            }
                                            placeholder="2000ms"
                                            disabled={loading}
                                            className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm outline-none focus:border-zinc-400"
                                        />

                                        {/* Remove */}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeConfigChange(index)
                                            }
                                            disabled={loading}
                                            className="rounded-lg border border-zinc-700 px-4 text-sm text-zinc-400 hover:bg-zinc-800"
                                        >
                                            Remove
                                        </button>

                                    </div>
                                )
                            )}

                        </div>

                        <button
                            type="button"
                            onClick={addConfigChange}
                            disabled={loading}
                            className="mt-4 rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
                        >
                            + Add Configuration
                        </button>

                    </section>

                    {/* ==================================================
              Infrastructure Changes
          ================================================== */}

                    <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-6">

                        <h2 className="text-lg font-semibold">
                            Infrastructure Changes
                        </h2>

                        <p className="mt-1 text-sm text-zinc-500">
                            Describe infrastructure changes included in this deployment.
                        </p>

                        <div className="mt-5 space-y-3">

                            {infraChanges.map(
                                (change, index) => (
                                    <div
                                        key={index}
                                        className="flex gap-3"
                                    >

                                        <input
                                            type="text"
                                            value={change}
                                            onChange={(event) =>
                                                updateInfraChange(
                                                    index,
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Redis 7.2 -> 7.4"
                                            disabled={loading}
                                            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm outline-none"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeInfraChange(index)
                                            }
                                            disabled={loading}
                                            className="rounded-lg border border-zinc-700 px-4 text-sm text-zinc-400 hover:bg-zinc-800"
                                        >
                                            Remove
                                        </button>

                                    </div>
                                )
                            )}

                        </div>

                        <button
                            type="button"
                            onClick={addInfraChange}
                            disabled={loading}
                            className="mt-4 rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
                        >
                            + Add Infrastructure Change
                        </button>

                    </section>

                    {/* ==================================================
              Error
          ================================================== */}

                    {error && (
                        <div className="rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
                            {error}
                        </div>
                    )}

                    {/* ==================================================
              Actions
          ================================================== */}

                    <div className="flex flex-col gap-3 border-t border-zinc-800 pt-6 sm:flex-row sm:items-center sm:justify-between">

                        <button
                            type="button"
                            onClick={loadDemoData}
                            disabled={loading}
                            className="rounded-lg border border-zinc-700 px-5 py-3 text-sm hover:bg-zinc-900"
                        >
                            Load Demo Data
                        </button>

                        <div className="flex gap-3">

                            <button
                                type="button"
                                onClick={() =>
                                    router.push("/dashboard")
                                }
                                disabled={loading}
                                className="rounded-lg border border-zinc-700 px-5 py-3 text-sm hover:bg-zinc-900"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={loading}
                                className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading
                                    ? "Creating deployment..."
                                    : "Analyze Deployment"}
                            </button>

                        </div>
                    </div>

                </form>
            </div>
        </main>
    );
}