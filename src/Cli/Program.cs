using Garments.Cli;

if (args.Length >= 2 && args[0] == "superuser" && args[1] == "create")
{
    return await SuperuserCommand.RunAsync(args[2..]);
}

Usage.Print();
return Usage.ExitCode;
