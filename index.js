import express from "express"
import mongoose from "mongoose"
import multer from "multer"
import cors from 'cors'
import { autorization, registration, updateUser, deleteUser, getMeInfo, getAllUsers } from "./controllers/UsersControl.js"
import { createTask, changeTaskStatus, updateTask, getAllTask, getOneTask, deleteOneTask } from './controllers/TasksControl.js'
import { createHabit, getOneHabit, deleteOneHabit, updateHabit, updateQuantitativeProgress, updateYesNoProgress, getAllHabits } from './controllers/HabitsControl.js'
import { regValidation, autorizationValidation, newsCreateValidation, programCreateValidation } from "./validations/validations.js"
import validationErrReq from "./middleware/validationErrReq.js"
import checkAuth from "./middleware/checkAuth.js"
import { upload, uploadPhoto, deletePhotoAndUpdateUser } from "./controllers/FilesControl.js"


mongoose.connect('mongodb+srv://admin:YoClQoFph0bQdLKL@cluster0.2c9tmdy.mongodb.net/planning?retryWrites=true&w=majority')
    .then(()=> console.log("Connect mongo"))
    .catch((err) => console.log("Error connect mongo", err));

const PORT = 5000;
const app = express();
app.use(express.json());
//app.use(cors()); //добавляем для снятия запрета делать запросы на сервер с других доменов

app.get('/', (req, res) => {
    // console.log(req.query);
    //в браузере по адресу http://localhost:5000/
    res.status(200).json("Сервер запущен!"); 
})
app.listen(PORT, (err) => {
    if (err) {
        return console.log(err); 
    }
    console.log("server start", + PORT);
});

app.post("/auth/login", autorizationValidation, validationErrReq, autorization);

//запрос на получение информации о себе (для проверки авторизации)
app.get('/auth/me', checkAuth, getMeInfo);

app.post('/auth/register', regValidation, validationErrReq, registration);

app.patch('/user/:id', checkAuth, regValidation, updateUser); //обновление данных о пользователе 

app.delete('/user/:id', checkAuth, deleteUser);

//загрузка аватарки
// Настройка пути: Указывает, что все запросы, начинающиеся с /uploads, должны обрабатываться этим middleware.
// Основной обработчик запроса возвращает URL файла, например /uploads/avatarsUser/avatar1.png.
// Когда клиент хочет получить загруженный файл, он отправляет GET запрос на этот URL uploads/avatarsUser/avatar1.png.
// Middleware express.static настраивает статический сервер, который ищет файл в директории uploads.
app.use('/uploads', express.static('uploads')); //ждем get запрос на получение статичного файла

//запрос на загрузку изображения аватарки пользователя
app.post('/uploads_avatar', checkAuth, upload.single('image2'), uploadPhoto);

//удаление аватара и ссылки на него
app.delete('/delete_avatar', checkAuth, deletePhotoAndUpdateUser);

//получить всех пользователей (для отображения на первом экране) МОЖНО СДЕЛАТЬ КАК ТОЛЬКО БУДЕТ НЕСКОЛЬКО ПОЛЬЗОВАТЕЛЕЙ УЖЕ ЗАРЕГАНО
app.get('/users', getAllUsers); //checkAuth,
//доп информация может быть количество созданных задач, привычек ...
//потом можно зайти в пользователя и увидеть его привычки и статистику по ним, это будет круто

//запрос на создание задачи
app.post('/createtask', checkAuth, validationErrReq, createTask); //checkAuth, taskCreateValidation, 

//получение всех своих задач (ВОЗМОЖНО НАДО ПОЛУЧАТЬ ТОЛЬКО ЗАГОЛОВКИ И ЕЩЕ КАКИЕ-ТО ДАННЫЕ, НО НЕ ВСЮ ИНФУ, ЧТОБЫ НЕ НАГРУЖАТЬ ЗАПРОС)
//либо получать задачи в определенном временнмо интервале
app.get('/mytasks', checkAuth, getAllTask); 

//получение одной задачи по id
app.get('/mytasks/:id', checkAuth, getOneTask);

//удаление одной задачи
app.delete('/mytasks/:id', checkAuth, deleteOneTask);

//редактирование задачи
app.patch('/tasks_update/:id', checkAuth, updateTask); // !!ДОБАВИТЬ ВАЛИДАЦИЮ

//смена статуса задачи (в процессе, завершена)
app.patch('/tasks_status/:id', checkAuth, changeTaskStatus); // !!ДОБАВИТЬ ВАЛИДАЦИЮ taskCreateValidation, 


//ПРИВЫЧКИ!!!!!!!
//запрос на создание привычки
app.post('/createhabit', checkAuth, createHabit);

// Маршрут для редактирования привычки
app.patch('/habits/:habitId', checkAuth, updateHabit);

// Маршрут для получения одной привычки
//НАСТРОИТЬ ЧТОБЫ МОЖНО БЕЗ АВТОРИЗАЦИИ БЫЛО, ЕСЛИ ПРИВАТНОСТЬ ОТКРЫТАЯ
app.get('/habits/:id', checkAuth, getOneHabit); 

// Маршрут для удаления одной привычки
app.delete('/habits/:id', checkAuth, deleteOneHabit);

//получение всех привычек
//НАСТРОИТЬ ЧТОБЫ МОЖНО БЕЗ АВТОРИЗАЦИИ БЫЛО, ЕСЛИ ПРИВАТНОСТЬ ОТКРЫТАЯ
app.get('/habits', checkAuth, getAllHabits); //app.get('/habits/:user_id', checkAuth, getAllHabits); 

//обновление статистики по привычке (даты выполнения, фиксация даты при достижении цели)
//мы кликаем на дату календарика заранее знаем измеримая или нет привычка и каждый раз мы передаем на сервер дату и прогресс
//только если изначально на дате было отмечено выполнено, то прогресс сразу забирается и отправляется на бэк без открытия окна для ввода прогресса
//на бэк должно прийти и поле даты и поле прогресса, просто елси дата есть уже в бэкенде, то она сотрется. 
app.patch('/habits_quant_progress/:id', checkAuth, updateQuantitativeProgress);

app.patch('/habits_no_quant_progress/:id', checkAuth, updateYesNoProgress);

//запрос на удаление даты достижения цели по единицам

//запрос на удаление даты достижения цели по дням



//принять вызов или челлендж, тоже вырабатывать привычку...



//будущие

//запрос на создание события (встречи)
// app.post('/createhabit', checkAuth, habitCreateValidation, validationErrReq, createHabit);

//подписка одного польозвателя на другого