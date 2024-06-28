//midlware - функция посредник, которая определит, можно ли вернуть информацию, доступную только авторизованному. Проверка токена
import jwt from 'jsonwebtoken'
import { keyJwt } from '../dataSecrets.js';

export default (req, res, next) => {
    //если пришел токен или пустая строка, то находим в этой строке Bearer и меняем его на пустую строку   
    const token = (req.headers.authorization || '').replace(/Bearer\s?/, ''); 
    console.log(token);
    //res.send(token); //ответ клиенкт вернем в виде кода токена
    if(token) { //раз есть токен, расшифруем его
        try {
            const decoded = jwt.verify(token, keyJwt);
            console.log(decoded); 
            req.userId = decoded._id; //запишем в ответ id пользователя 
            // console.log("Вот id пользователя первоисточник ", req.userId);
            //ОБЯЗАТЕЛЬНО НАДО ЧТО-ТО ВЕРНУТЬ ИЛИ ВЫПОЛНИТЬ ФУНКЦИЮ NEXT, ЧТОБЫ ПРОДОЛЖИТЬ ВЫПОЛНЕНИЕ ПРОГРАММЫ 
            next();
        }
        catch (err) {
            console.log(err);
            return res.status(403).json({
                message: 'Нет доступа',
            })
        }
    } else {
        return res.status(403).json({
            message: 'Нет доступа',
        })
    }
}