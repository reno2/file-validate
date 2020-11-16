document.addEventListener("DOMContentLoaded", () => {
    document.querySelector('.single-img__input').addEventListener('change', function (e) {
        formsFile.init(this, 'post-image', true);
    })
    document.querySelector('.create-form__form').addEventListener('submit', function (e) {
        formsFile.formSubmit(this.getAttribute('action'), e)
    })

})

const formsFile = {
    submit: null,
    multiple: false,
    files: [],
    input: null,
    sendFiles: [],
      // Инициализация 
    init(input, formId, multiple) {
        formsFile.multiple = multiple
        formsFile.input = input
        let form = document.getElementById(formId)
        formsFile.submit = form.querySelector('button[type="submit"]')
        if (multiple) {
            formsFile.files = input.files
        } else {
            formsFile.files = []
            formsFile.sendFiles = []
            formsFile.files = input.files[0]
        }
        formsFile.fileLoad(input)

    },
    // Отправка фомы
    formSubmit(url, e) {
        e.preventDefault()
        if (formsFile.sendFiles) {
            let formData = new FormData();
            for (let f in formsFile.sendFiles) {
                formData.append("images[]", formsFile.sendFiles[f]);
            }
            axios.post(url,
                formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }).then(function (response) {
                console.log(response)
            })
        }
    },
    // Вывод превьюшек
    showUploadedItem(source, file) {
        let previewList = document.querySelector(".image-preview"),
            previewItem = `
                <div class="image-preview__item">
                    <img src="${source}" alt="">
                    <span class="image-preview__name">${file.name}</span>
                    <svg onclick="formsFile.removeFile(this)" data-name="${file.name}" class="image-preview__del">
                        <use xlink:href="/images/icons.svg#icon-close"></use>
                    </svg>
                </div>
            `;
        if (formsFile.multiple) previewList.innerHTML += previewItem;
        else previewList.innerHTML = previewItem;
    },
    // Вополняем после загрузки файла
    fileLoad(input) {
        console.log(Object.keys(formsFile.sendFiles).length)
        if (formsFile.files.length) {

            formsFile.removeNotice(input);
            let valid = true
            // Перебераем загруженные файлы
            Array.from(formsFile.files).forEach((el) => {
                let currentFile = el;
                // Применяем правила валидации в файлу
                for (let code in formsFile.validateRule) {
                    console.log(formsFile.validateRule[code].call(el, el, input))
                    if (!formsFile.validateRule[code].call(el, el, input)) {
                        valid = false;
                        input.value = ""
                        break;
                    }
                }
                // Если файл прошёл валидацию
                if (valid) {
                    let reader = new FileReader();
                    reader.onload = (el) => {
                        // Добавляем в дом загруженный файл, проверяем на дубли
                        if (!formsFile.sendFiles[currentFile.name])
                            formsFile.showUploadedItem(reader.result, currentFile);
                        // Добавляем в финальный массив файл
                        formsFile.sendFiles[currentFile.name] = currentFile;

                    }
                    reader.readAsDataURL(el);
                }
            })
        }
    },
    // Удаление файлов
    removeFile(el) {
        // Получаем значения индекс
        let inx = el.getAttribute('data-name')
        // Удаляем из массива для передачи на бэкенд
        delete formsFile.sendFiles[inx]
        // Удаляем дом элемент
        el.parentElement.remove()
        formsFile.removeNotice(formsFile.input);
    },
    // Запрещаем или разрешаем отправку формы
    formStatus(status) {
        if (!status) formsFile.submit.disabled = true;
        else formsFile.submit.disabled = false;
    },
    // Правили валидации
    validateRule: {
        limit: (file, el) => {
            let msg = 'Максимальное количество файлов 2';
            if (Object.keys(formsFile.sendFiles).length + 1 > 2 || formsFile.input.files.length > 2) {
                formsFile.showNotice(el, msg)
                return false
            }
            return true
        },
        size: (file, el) => {
            let msg = 'Максимальный размер 2 мб';
            if (file.size > 1024 * 1024 * 2) {
                formsFile.showNotice(el, msg)
                return false
            }
            return true
        },
        type: (file, el) => {
            let allowTypes = ['jpg', 'jpeg', 'png'],
                msg = `Разрешены только следующие типы ${allowTypes.join(', ')}`;
            //console.log(file)
            let fileExtension = file.type.split("/").pop();
            if (!allowTypes.includes(fileExtension)) {
                formsFile.showNotice(el, msg)
                return false
            }
            return true
        }
    },
    // Убераем сообщения об ошибках
    removeNotice(el) {
        el.nextElementSibling.classList.remove('show')
    },
    // Выводим сообщение об ошибках
    showNotice(el, msg) {
        let errorElement = el.nextElementSibling
        errorElement.classList.add("show")
        errorElement.innerHTML = msg
    },
}
