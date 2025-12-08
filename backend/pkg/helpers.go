package pkg

import (
	"fmt"
	"inboard-server/internal/models/dto"
	"inboard-server/internal/models/models"
	"inboard-server/pkg/vars"
	"log"
	"os"
	"strings"

	"github.com/playwright-community/playwright-go"
)

type PageSize struct {
	Width  string `json:"width"`
	Height string `json:"height"`
}

func GetConsoleMessage(status, method, uri string) string {
	return vars.Yellow + status + vars.Bold + vars.Green + " " + method + vars.Reset + vars.Blue + " " + uri + "\n" + vars.Reset
}

func GeneratePDF(browser playwright.Browser, board models.BoardDescription, blocks []dto.Block) ([]byte, error) {
	page, err := browser.NewPage()
	if err != nil {
		return []byte(""), err
	}

	html := generateHTML(board, blocks)
	page.SetContent(html)

	writeHtmlToFile(html)

	result, err := page.Evaluate(CalculateSizeJs)
	if err != nil {
		return []byte(""), err
	}

	pageSize := result.(map[string]interface{})
	pageWidth, pageHeight := pageSize["width"].(string), pageSize["height"].(string)

	pdf, err := page.PDF(playwright.PagePdfOptions{
		Width:  &pageWidth,
		Height: &pageHeight,
	})
	if err != nil {
		return []byte(""), err
	}

	page.Close()

	return pdf, nil
}

func generateHTML(board models.BoardDescription, blocks []dto.Block) string {
	content := HtmlPrefix
	content += `		<h1>` + board.Name + "</h1>"
	content += `		<h2>` + board.Description + "</h2>"
	content += `		<hr />`
	content += `		<div class="main">` + "\n"

	if len(blocks) > 0 {
		pageOffsetX, pageOffsetY := blocks[0].PosX, blocks[0].PosY
		for _, block := range blocks[1:] {
			pageOffsetX = min(pageOffsetX, block.PosX)
			pageOffsetY = min(pageOffsetY, block.PosY)
		}

		for _, block := range blocks {
			dataSplited := strings.SplitN(block.Data, ":", 4)
			blockType := dataSplited[2]
			data := dataSplited[3]
			styles := ""
			if blockType == "image" {
				styles = fmt.Sprintf("left: %dpx; top: %dpx; max-width: 400px;", block.PosX-pageOffsetX, block.PosY-pageOffsetY)
				content += fmt.Sprintf(`			<div class="image-block" style="%s"><img src="%s"></img></div>`+"\n", styles, data)
			} else {
				styles = fmt.Sprintf("left: %dpx; top: %dpx; max-width: 400px; min-height: 300px", block.PosX-pageOffsetX, block.PosY-pageOffsetY)
				content += fmt.Sprintf(`			<div class="block" style="%s">%s</div>`+"\n", styles, data)
			}
		}
	}

	content += `		</div>` + "\n"
	return content + HtmlPosfix
}

func writeHtmlToFile(html string) {
	f, err := os.Create("./screenshots/test.html")
	if err != nil {
		log.Fatal(err)
	}
	defer f.Close()

	_, err = f.WriteString(html)
	if err != nil {
		log.Fatal(err)
	}
}
