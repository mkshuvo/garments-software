using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace Garments.Tests.Architecture;

/// <summary>
/// L3 — no fake success. The legacy build shipped cash-book endpoints that returned
/// <c>journalEntryId = Guid.NewGuid()</c> and logged success while writing nothing, and
/// <c>NotImplementedException</c> behind routes that answered 200. A client must never be told a
/// financial document was saved unless a row was created.
/// </summary>
internal sealed class NoFakeSuccessLaw : EngineeringLaw
{
    private static readonly string[] FabricatedIdProperties =
    [
        "journalEntryId", "transactionId", "invoiceId", "orderId", "entryId", "documentId", "paymentId",
    ];

    public string Id => "L3";

    public string Rule => "No endpoint may report success it did not earn: no fabricated ids, no NotImplementedException behind a 200.";

    public IEnumerable<Violation> FindViolations()
    {
        foreach (var path in SourceTree.ProductionSourceFiles)
        {
            var relative = SourceTree.Relative(path);
            var root = CSharpSyntaxTree.ParseText(SourceTree.ReadSource(path), path: path).GetRoot();

            foreach (var throwStatement in root.DescendantNodes().OfType<ThrowStatementSyntax>())
            {
                if (throwStatement.Expression is ObjectCreationExpressionSyntax created
                    && created.Type.ToString().Contains("NotImplemented", StringComparison.Ordinal))
                {
                    var containingRoute = AnnotatedRouteMethod(throwStatement);
                    if (containingRoute is not null)
                    {
                        yield return new Violation(
                            relative,
                            throwStatement.GetLocation().GetLineSpan().StartLinePosition.Line + 1,
                            Id,
                            "NotImplementedException inside a routed action: the caller gets an unhandled failure or a fake response, never a real one.");
                    }
                }
            }

            foreach (var assignment in root.DescendantNodes().OfType<AssignmentExpressionSyntax>())
            {
                if (assignment.Left is not MemberAccessExpressionSyntax
                    || assignment.Right is not InvocationExpressionSyntax)
                {
                    continue;
                }

                var left = assignment.Left.ToString();
                var propertyName = left[(left.LastIndexOf('.') + 1)..];

                var isFabricatedId = assignment.Right.ToString().Contains("Guid.NewGuid()", StringComparison.Ordinal)
                    && FabricatedIdProperties.Contains(propertyName, StringComparer.OrdinalIgnoreCase)
                    && propertyName.EndsWith("Id", StringComparison.Ordinal);

                if (isFabricatedId && AnnotatedRouteMethod(assignment) is not null)
                {
                    yield return new Violation(
                        relative,
                        assignment.GetLocation().GetLineSpan().StartLinePosition.Line + 1,
                        Id,
                        $"'{propertyName} = Guid.NewGuid()' in a routed method reports an identifier that was never persisted.");
                }
            }
        }
    }

    private static MethodDeclarationSyntax? AnnotatedRouteMethod(SyntaxNode node)
    {
        var method = node.Ancestors().OfType<MethodDeclarationSyntax>().FirstOrDefault();
        if (method is null)
        {
            return null;
        }

        return method.AttributeLists
            .SelectMany(list => list.Attributes)
            .Any(attribute => attribute.Name.ToString().Contains("Http", StringComparison.Ordinal)
                || attribute.Name.ToString().Contains("Route", StringComparison.Ordinal))
            ? method
            : null;
    }
}
