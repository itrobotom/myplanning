import UserModel from "../models/User.js"
import TaskListModel from "../models/TaskList.js"

export const createTask = async (req, res) => {
    try {
        const { user_id, period, repeat, days_of_week, planned_end_date, actual_end_date, content, category, planned_time, actual_time, priority, status } = req.body; //, comments, urls_images, like_count, view_count, task_chat

        // Проверка наличия пользователя
        const user = await UserModel.findById(user_id);
        if (!user) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }

        // Найти список задач пользователя
        let taskList = await TaskListModel.findOne({ user_id });

        // Если у пользователя нет списка задач, создать новый
        if (!taskList) {
            taskList = new TaskListModel({ user_id });
        }

        // Создать новую задачу
        const newTask = {
            period,
            repeat,
            days_of_week,
            planned_end_date,
            actual_end_date,
            content,
            category,
            planned_time,
            actual_time,
            priority,
            status,
            // comments,
            // urls_images,
            // like_count,
            // view_count,
            // task_chat
        };

        // Добавить задачу в список задач пользователя
        taskList.tasks.push(newTask);

        // Сохранить изменения
        await taskList.save();

        res.json({
            message: "Задача успешно создана",
            task: newTask
        });
    } catch (err) {
        res.status(500).json({
            message: "Не удалось создать задачу",
        });
        console.log("Ошибка", err);
    }
}

//функция для изменения отдельных полей, так и всех полей задачи
const findAndModifyTask = async (user_id, taskId, updateFields) => {
    const taskList = await TaskListModel.findOne({ user_id });  // Найти список задач, привычек и тд пользователя

    if (!taskList) {
        throw new Error("Список задач, привычек, встреч пользователя не найден");
    }

    const task = taskList.tasks.id(taskId); //ищем конктретную задачу по ее id

    if (!task) {
        throw new Error("Задача не найдена");
    }

    Object.assign(task, updateFields); // использую новые данные подставляем их в task
    await taskList.save(); //сохраняем в базе задачу

    return task;
};

export const changeTaskStatus = async (req, res) => {
    try {
        const { user_id, status } = req.body; 
        const taskId = req.params.id;

        await findAndModifyTask(user_id, taskId, { status });

        res.json({
            success: true,
        });
        
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Не удалось поменять статус',
        });
    }
};

export const updateTask = async (req, res) => {
    try {
        const { user_id, period, repeat, days_of_week, planned_end_date, actual_end_date, content, category, planned_time, actual_time, priority, status } = req.body;
        const taskId = req.params.id;
        const taskData = {
            period,
            repeat,
            days_of_week,
            planned_end_date,
            actual_end_date,
            content,
            category,
            planned_time,
            actual_time,
            priority,
            status
        };
        await findAndModifyTask(user_id, taskId, taskData);

        console.log(taskData); 
        res.json({
            success: true,
        });
        
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Не удалось обновить задачу',
        });
    }
};

export const getAllTask = async (req, res) => {
    try {
        // const { user_id } = req.body;
        // Проверка наличия пользователя
        // const user = await UserModel.findById(user_id);
        // запрос проходит после проверки авторизации, где уже запрашиваются данные пользователя
        // поэтому в запрос req напрямую с фронтенда id можно не передавать 
        const user_id = req.userId;
        const user = await UserModel.findById(user_id);  

        if (!user) {
            console.log("Пользователь не найден");
            return res.status(404).json({ message: "Пользователь не найден" });
        }
        const taskList = await TaskListModel.findOne({ user_id });  // Найти список задач пользователя
        if (!taskList) {
            throw new Error("Список задач пользователя не найден");
        }

        console.log(taskList); 
        res.json({
            success: true,
            taskList: taskList
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Не удалось получить задачи пользователя',
        });
    }
};

// Вспомогательная функция для проверки пользователя и получения задач
const getUserAndTaskList = async (userId, taskId) => {
    // Проверка валидности ObjectId пользователя и задачи (не работает пока)
    // if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(taskId)) {
    //     throw new Error("Некорректный идентификатор пользователя или задачи");
    // }

    // Проверка наличия пользователя
    const user = await UserModel.findById(userId);
    if (!user) {
        throw new Error("Пользователь не найден");
    }

    // Найти список задач пользователя
    const taskList = await TaskListModel.findOne({ user_id: userId });
    if (!taskList) {
        throw new Error("Список задач пользователя не найден");
    }

    // Найти задачу по id
    const task = taskList.tasks.id(taskId);
    if (!task) {
        throw new Error("Задача не найдена");
    }

    return { user, taskList, task };
};

export const getOneTask = async (req, res) => {
    try {
        const { user_id } = req.body;
        const taskId = req.params.id;

        console.log('ID задачи из URL:', taskId);
        console.log('ID пользователя из тела запроса:', user_id);

        const { task } = await getUserAndTaskList(user_id, taskId);

        res.json({
            success: true,
            task: task
        });
    } catch (err) {
        console.error("Ошибка при получении задачи:", err.message);
        res.status(500).json({
            message: err.message || 'Не удалось получить задачу',
        });
    }
};

export const deleteOneTask = async (req, res) => {
    try {
        const { user_id } = req.body;
        const taskId = req.params.id;

        console.log('ID задачи из URL:', taskId);
        console.log('ID пользователя из тела запроса:', user_id);

        const { taskList, task } = await getUserAndTaskList(user_id, taskId);

        // Удаление задачи
        taskList.tasks.pull(taskId);
        await taskList.save();

        res.json({
            success: true,
            message: 'Задача успешно удалена',
        });
    } catch (err) {
        console.error("Ошибка при удалении задачи:", err.message);
        res.status(500).json({
            message: err.message || 'Не удалось удалить задачу',
        });
    }
};






// export const changeTaskStatus = async (req, res) => {
//     //console.log("Пришел для обновления новости объект: ", req);
//     try {
//         const { user_id, status } = req.body;
//         const taskId = req.params.id;
//         // Проверка наличия пользователя
//         const user = await UserModel.findById(user_id);
//         if (!user) {
//             return res.status(404).json({ message: "Пользователь не найден" });
//         }

//         // Найти список задач пользователя
//         let taskList = await TaskListModel.findOne({ user_id });

//         // Найти задачу в списке задач
//         let task = taskList.tasks.id(taskId);

//         if (!task) {
//             return res.status(404).json({ message: "Задача не найдена" });
//         }
//         // Обновить статус задачи
//         task.status = status;
//         // Сохранить изменения
//         await taskList.save();
    
//         res.json({
//             success: true,
//         })    
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({
//             message: 'Не удалось поменять статус',
//         });
//     }
// }