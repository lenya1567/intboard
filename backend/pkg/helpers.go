package pkg

import "inboard-server/pkg/vars"

func GetConsoleMessage(status, method, uri string) string {
	return vars.Yellow + status + vars.Bold + vars.Green + " " + method + vars.Reset + vars.Blue + " " + uri + "\n" + vars.Reset
}
