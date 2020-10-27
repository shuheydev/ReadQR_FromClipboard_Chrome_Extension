(function () {
    if (!("browser" in window)) {
        window.browser = chrome;
    }

    let elem = document.querySelector("#pasteArea");
    elem.addEventListener("paste", function (e) {
        if (!e.clipboardData
            || !e.clipboardData.types
            || (e.clipboardData.types.length != 1)
            || (e.clipboardData.types[0] != "Files")) {
            return true;
        }

        let imageFile = e.clipboardData.items[0].getAsFile();

        const canv = document.querySelector("canvas");
        const context = canv.getContext("2d");


        const chara = new Image();
        chara.onload = (e) => {
            let img = document.querySelector("#outputImage");
            // canv.height = img.height;

            console.log(chara);

            context.drawImage(chara, 0, 0, canv.width, canv.height,);
            let imgData = context.getImageData(0, 0, canv.width, canv.height);
            let qr = jsQR(imgData.data, imgData.width, imgData.height);
            if (qr) {
                console.log("Found", qr);
                document.querySelector("#qrContents").textContent = qr.data;
            }
        };

        let fr = new FileReader();
        fr.onload = function (e) {
            let base64 = e.target.result;
            document.querySelector("#outputImage").src = base64;
            document.querySelector("#outputText").textContent = base64;

            chara.src = base64;
        };




        fr.readAsDataURL(imageFile);

        this.innerHTML = "paste image here";

    });


    let button_currentTab = document.querySelector("#button_currentTab");
    button_currentTab.addEventListener('click', (e) => {
        console.log('Get data');

        let label = document.getElementById('testLabel');
        navigator.clipboard.readText().then(text => label.innerText = text);

    });

    let button_newTab = document.querySelector("#button_newTab");
    button_newTab.addEventListener('click', (e) => {
        console.log('New Tab');

        browser.tabs.query({ active: true, currentWindow: true }, tabs => {
            let url = tabs[0].url;
            let index = tabs[0].index;

            //対象サイトに絞る
            if (!isTargetSites(url)) {
                window.close();
                return;
            }

            //言語を日本語に変更
            let newUrl = changeLanguage(url);

            //urlを別タブで開く(現在のタブのとなり)
            browser.tabs.create({ url: newUrl, index: index + 1 });

            window.close();
        });
    });

    let button_newWindow = document.querySelector("#button_newWindow");
    button_newWindow.addEventListener('click', (e) => {
        console.log('New Window');

        browser.tabs.query({ active: true, currentWindow: true }, tabs => {
            let url = tabs[0].url;
            console.log(tabs);

            //対象サイトに絞る
            if (!isTargetSites(url)) {
                window.close();
                return;
            }

            //言語を日本語に変更
            let newUrl = changeLanguage(url);

            //urlを別ウィンドウで開く
            browser.windows.create({ url: newUrl });

            window.close();
        });
    });

    //対象サイトか否かをチェック
    //*.microsoft.com
    function isTargetSites(url) {
        const re = /^https:\/\/.+?\.microsoft\.com\/.*$/gi;
        return re.test(url);
    }

    //日英切り替え
    //日本語は英語に
    //日本語以外は日本語に
    function changeLanguage(url) {
        const reLang = /(?<=https:\/\/.+?\.microsoft\.com\/).*?(?=\/)/gi;
        let result = url.match(reLang);

        if (result === null) {
            return "";
        }
        let lang = result[0];

        let replacement = "";
        if (lang === "ja-jp") {
            replacement = "en-us";
        }
        else {
            replacement = "ja-jp";
        }

        return url.replace(reLang, replacement);
    }
})();