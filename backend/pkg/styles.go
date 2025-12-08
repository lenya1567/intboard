package pkg

const HtmlStyles = `		<style>
			* {
				margin: 0;
				padding: 0;
				font-family: "Noto Sans", system-ui, Avenir, Helvetica, Arial, sans-serif;

				font-synthesis: none;
				text-rendering: optimizeLegibility;
				-webkit-font-smoothing: antialiased;
				-moz-osx-font-smoothing: grayscale;
			}

			h1 {
				font-weight: bold;
				padding: 32px;
				padding-bottom: 0;
			}

			h2 {
				font-weight: 300;
				color: lightgray;
				padding: 32px;
				padding-top: 0;
			}
			
			hr {
				border: 0.5px solid lightgray
			}

			.main {
				position: relative;
				margin: 32px;
			}

			.image-block, .block {
				position: absolute;
				border-radius: 8px;
				border: 2px solid black;
				color: black;
				min-width: 400px;

				box-sizing: border-box;
				display: flex;
				flex-direction: column;
				gap: 4px;

				background-color: white;
				overflow: hidden;

				overflow-wrap: break-word;
			}

			.block {
				padding: 16px;
			}

			.block ul {
				display: flex;
				flex-direction: column;
				list-style-type: none;
				gap: 4px;
			}

			.block li::before {
				content: "-";
				align-items: center;
				margin-right: 4px;
			}
		</style>
`

const HtmlPrefix = `<html>
	<head>
` + HtmlStyles + `	</head>
	<body>
`

const HtmlPosfix = `	</body>
</html>
`

const CalculateSizeJs = `
(() => {
	const blocks = document.querySelectorAll(".block")
	let mxX = 0;
	let mxY = 0;
	blocks.forEach((block) => {
		const rect = block.getClientRects()[0]
		mxX = Math.max(mxX, rect.left + rect.width + 32, mxX);
		mxY = Math.max(mxY, rect.top + rect.height + 32, mxY);
	})
	return { width: mxX + "px", height: mxY + "px" }
})()
`
