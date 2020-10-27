(function () {
    if (!("browser" in window)) {
        window.browser = chrome;
    }

    let elem = document.querySelector("#pasteArea");
    elem.addEventListener("click", (e) => {
        elem.style.backgroundColor = "#D5FFD1";
    });
    elem.addEventListener("paste", function (e) {
        //guard non image contents.
        //reference: https://qiita.com/tatesuke/items/00de1c6be89bad2a6a72
        if (!e.clipboardData
            || !e.clipboardData.types
            || (e.clipboardData.types.length != 1)
            || (e.clipboardData.types[0] != "Files")) {
            return true;
        }

        //Get image from clipboard as file
        let imageFile = e.clipboardData.items[0].getAsFile();

        //get canvas element and context
        const canvas = document.querySelector("#canvas_for_ImageData");
        const context = canvas.getContext("2d");

        //Create Image object
        const chara = new Image();
        //execute when image loaded to Image object
        chara.onload = (e) => {
            //draw loaded image on canvas
            context.drawImage(chara, 0, 0, canvas.width, canvas.height,);

            //get ImageData from canvas
            let imgData = context.getImageData(0, 0, canvas.width, canvas.height);

            //Decode QR code in the image.
            let qr = jsQR(imgData.data, imgData.width, imgData.height);
            if (qr) {
                console.log("Found", qr);
                document.querySelector("#decodeResult").textContent = qr.data;
            }
        };

        let fr = new FileReader();
        fr.onload = function (e) {
            let base64 = e.target.result;
            //for preview
            document.querySelector("#clipboardImage").src = base64;

            //Set image to Image object
            //onload event will be fired.
            chara.src = base64;
        };

        //Read image data from image file
        fr.readAsDataURL(imageFile);
    });

    let button_newTab = document.querySelector("#button_OpenUrl");
    button_newTab.addEventListener('click', (e) => {
        console.log('Open Url');

        let url = document.querySelector("#decodeResult").innerText;
        if (url === "") {
            return;
        }

        browser.tabs.query({ active: true, currentWindow: true }, tabs => {
            let index = tabs[0].index;

            //Open the url on tab that next to current tab
            browser.tabs.create({ url: url, index: index + 1 });

            window.close();
        });
    });
})();