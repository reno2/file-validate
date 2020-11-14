document.addEventListener("DOMContentLoaded", () => {
    document.querySelector('.single-img__input').addEventListener('change', function(){
        formsFile.init(this, 'post-image');
    })

})
let formsFile = {
    submit : null,
    init(input, formId){
        let form = document.getElementById(formId)
        formsFile.submit = form.querySelector('button[type="submit"]')
        formsFile.fileLoad(input)
    },
    // Вополняем после загрузки файла
    fileLoad(input){
        if(input.files !== 'undefined'){
            formsFile.removeNotice(input);
            if(!formsFile.validate(input.files, input))
                formsFile.formStatus(false)
            else formsFile.formStatus(true)
        }
    },
    // Запрещаем или разрешаем отправку формы
    formStatus(status){
        if(!status) formsFile.submit.disabled = true;
        else formsFile.submit.disabled = false;
    },
    // Проходим по всем валидаторам и возвращаем статус валидации, если false прерывем цикл
    validate(files, element) {
        let valid = true;
        Array.from(files).forEach((el) => {
            for (let code in formsFile.validateRule) {
               if(!formsFile.validateRule[code].call(el, el, element)){
                   valid = false;
                   break;
               }
            }
        })
        return valid;
    },
    validateRule: {
        // Добавляются методы для валидации
        size:(file, el)=>
        {
            let msg = 'Максимальный размер 2 мб';
            if (file.size > 1024*1024*2) {
                formsFile.showNotice(el, msg)
                return false
            }
            return true
        },
        type: (file, el) => {
            let allowTypes = ['jpg', 'jpeg', 'png'],
                msg = `Разрешены олько следующие типы ${allowTypes.join(', ')}`;
            let  fileExtension = file.type.split("/").pop();
            console.log(allowTypes.includes(fileExtension))
            if(!allowTypes.includes(fileExtension)){
                formsFile.showNotice(el, msg)
                return false
            }
            return true
        }
    },
    // Убераем сообщения об ошибках
    removeNotice(el){
        el.nextElementSibling.classList.remove('show')
    },
    // Выводим сообщение об ошибках
    showNotice(el, msg){
        let errorElement =  el.nextElementSibling
        errorElement.classList.add("show")
        errorElement.innerHTML = msg
    },
}
