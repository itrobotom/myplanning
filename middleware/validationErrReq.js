import { validationResult } from "express-validator"

export default (req, res, next) => {
    //спарсим ошибки, если таковы имеются
    //validationResult — это функция, которая извлекает ошибки валидации из объекта запроса.
    // Если массив ошибок не пустой (errors.isEmpty() возвращает false), то:

    // Возвращается ответ с кодом состояния 400 (Bad Request).
    // Ошибки отправляются в формате JSON.
    const errors = validationResult(req); // извлекаем ошибки валидации, которые могли возникнуть в предыдущих middleware-функциях, проверяющих данные запроса.
    if(!errors.isEmpty()){
        return res.status(400).json(errors.array());
    }
    // Если ошибок нет, вызывается функция next(), которая передает управление следующему middleware или обработчику маршрута.
    next(); 
}