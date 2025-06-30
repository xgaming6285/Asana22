"use client";

const ProjectForm = ({
    projectFormState,
    onFormChange,
    onSubmit,
    error,
    isCreating,
}) => (
    <div className="bg-gray-800 p-6 sm:p-8 rounded-xl shadow-2xl border border-gray-700 space-y-8 mb-10">
        <div>
            <h2 className="text-3xl font-semibold text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-400">
                Launch a New Project
            </h2>
            <p className="text-center text-gray-400 mb-8">
                Fill in the details below to get started.
            </p>
        </div>

        {error && (
            <div className="bg-red-800 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-sm font-medium flex items-center">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-red-300"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                    />
                </svg>
                {error}
            </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
            <div className="flex flex-col gap-2">
                <label
                    htmlFor="projectName"
                    className="font-semibold text-sm text-gray-300"
                >
                    Project Name *
                </label>
                <input
                    type="text"
                    id="projectName"
                    name="name"
                    autoComplete="off"
                    className="border border-gray-600 bg-gray-700 text-white rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-purple-500 transition placeholder-gray-500 shadow-sm"
                    value={projectFormState.name}
                    onChange={onFormChange}
                    placeholder="e.g., Website Redesign, Mobile App Launch"
                    required
                />
            </div>
            <div className="flex flex-col gap-2">
                <label
                    htmlFor="projectDescription"
                    className="font-semibold text-sm text-gray-300"
                >
                    Description (Optional)
                </label>
                <textarea
                    id="projectDescription"
                    name="description"
                    autoComplete="off"
                    className="border border-gray-600 bg-gray-700 text-white rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-purple-500 transition h-28 resize-none placeholder-gray-500 shadow-sm"
                    value={projectFormState.description}
                    onChange={onFormChange}
                    placeholder="Briefly describe your project's goals and objectives."
                />
            </div>

            <button
                type="submit"
                className="w-full flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3.5 rounded-lg hover:from-purple-700 hover:to-pink-700 focus:ring-4 focus:ring-purple-400 focus:ring-opacity-50 disabled:opacity-60 text-base font-semibold shadow-lg transition duration-150 ease-in-out"
                disabled={isCreating}
            >
                {isCreating ? (
                    <>
                        <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            ></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                        Creating Project...
                    </>
                ) : (
                    "Create Project & Get Started"
                )}
            </button>
        </form>
    </div>
);

export default ProjectForm; 