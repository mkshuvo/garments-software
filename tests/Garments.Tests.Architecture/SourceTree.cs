namespace Garments.Tests.Architecture;

/// <summary>
/// Locates and enumerates the source files the engineering-law rules run against.
/// </summary>
internal static class SourceTree
{
    private static readonly string[] BuildArtifactDirs = ["obj", "bin", "node_modules", ".next", "legacy"];

    internal static string RepositoryRoot { get; } = FindRepositoryRoot();

    internal static IReadOnlyList<string> ProductionSourceFiles { get; } = EnumerateSourceFiles("src");

    internal static IReadOnlyList<string> AllSourceFiles { get; } = EnumerateSourceFiles("src", "tests");

    internal static IReadOnlyList<string> ProductionProjectFiles { get; } =
        Directory.EnumerateFiles(Path.Combine(RepositoryRoot, "src"), "*.csproj", SearchOption.AllDirectories)
            .OrderBy(path => path, StringComparer.Ordinal)
            .ToArray();

    /// <summary>
    /// Reads a source file with the BOM stripped, so byte-order marks never break a text rule.
    /// </summary>
    internal static string ReadSource(string path) => File.ReadAllText(path).TrimStart('﻿');

    /// <summary>Repository-relative path with forward slashes, for readable failure output.</summary>
    internal static string Relative(string path) =>
        Path.GetRelativePath(RepositoryRoot, path).Replace('\\', '/');

    private static string[] EnumerateSourceFiles(params string[] roots)
    {
        var files = new List<string>();

        foreach (var rootName in roots)
        {
            var root = Path.Combine(RepositoryRoot, rootName);
            if (!Directory.Exists(root))
            {
                continue;
            }

            foreach (var candidate in Directory.EnumerateFiles(root, "*.cs", SearchOption.AllDirectories))
            {
                var relative = Path.GetRelativePath(RepositoryRoot, candidate).Replace('\\', '/');
                if (BuildArtifactDirs.Any(segment => relative.Contains($"/{segment}/", StringComparison.Ordinal))
                    || relative.StartsWith("legacy/", StringComparison.Ordinal)
                    || relative.EndsWith(".AssemblyInfo.cs", StringComparison.Ordinal))
                {
                    continue;
                }

                files.Add(candidate);
            }
        }

        return files.OrderBy(path => path, StringComparer.Ordinal).ToArray();
    }

    private static string FindRepositoryRoot()
    {
        var start = AppContext.BaseDirectory;
        var probe = new DirectoryInfo(start);

        while (probe is not null)
        {
            if (File.Exists(Path.Combine(probe.FullName, "GarmentsERP.slnx")))
            {
                return probe.FullName;
            }

            probe = probe.Parent;
        }

        throw new InvalidOperationException(
            $"Could not locate the repository root above {start}. Run tests from the GarmentsERP solution.");
    }
}
