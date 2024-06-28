import UserModel from "../models/User.js"
import TaskListModel from "../models/TaskList.js"

export const createHabit = async (req, res) => {
    try {
        //т.к. создает привычку только авторизованный пользователь, то при проверке checkAuth мы имеем уже id пользвоателя
        const user_id = req.userId;
        const { start_date, content, privacy, repeat, days_of_week, planned_time, actual_time, progress_type, goal_type, goal, categories } = req.body;
        
        // Проверка наличия пользователя
        const user = await UserModel.findById(user_id);
        if (!user) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }

        // Найти список задач и привычек пользователя
        let taskList = await TaskListModel.findOne({ user_id }); // Найти список задач, привычек и тд пользователя
        // Если у пользователя нет списка задач и привычек, создать новый
        if (!taskList) {
            taskList = new TaskListModel({ user_id });
        }

        // Создать новую привычку
        const newHabit = {
            content,
            start_date,
            privacy,
            repeat,
            days_of_week,
            planned_time,
            actual_time,
            progress_type,
            goal_type,
            goal,
            categories,
            author_id: user_id,
            statistics_goal: {
                progress_data: [],
                days_completed: 0,
                total_units: 0,
                goal_achieved_date_day: null,
                goal_achieved_date_unit: null
            }
        };

        // Добавить привычку в список привычек пользователя
        taskList.habits.push(newHabit);

        // Сохранить изменения
        await taskList.save();

        res.json({
            message: "Привычка успешно создана",
            habit: newHabit
        });
    } catch (err) {
        res.status(500).json({
            message: "Не удалось создать привычку",
        });
        console.log("Ошибка", err);
    }
};

const findAndModifyHabit = async (user_id, habitId, updateFields) => { //вспомогательная функция для редактирования привычки
    const taskList = await TaskListModel.findOne({ user_id });  // Найти список задач, привычек и тд пользователя

    if (!taskList) {
        throw new Error("Список задач, привычек, встреч пользователя не найден");
    }

    const habit = taskList.habits.id(habitId); // Ищем конкретную привычку по ее id

    if (!habit) {
        throw new Error("Привычка не найдена");
    }

    // Разделяем обновляемые поля на общие и специфические для разных типов привычек
    const commonFields = ['content', 'repeat', 'planned_time', 'privacy'];
    const quantitativeFields = ['goal.total_amount', 'goal.unit', 'goal_type'];
    const yesNoFields = ['goal.days'];

    commonFields.forEach(field => {
        if (updateFields[field] !== undefined) {
            habit[field] = updateFields[field];
        }
    });

    if (habit.progress_type === 'quantitative') {
        quantitativeFields.forEach(field => {
            const fieldParts = field.split('.');
            if (updateFields[fieldParts[0]] && updateFields[fieldParts[0]][fieldParts[1]] !== undefined) {
                habit[fieldParts[0]][fieldParts[1]] = updateFields[fieldParts[0]][fieldParts[1]];
            }
        });
    } else if (habit.progress_type === 'yes/no') {
        yesNoFields.forEach(field => {
            const fieldParts = field.split('.');
            if (updateFields[fieldParts[0]] && updateFields[fieldParts[0]][fieldParts[1]] !== undefined) {
                habit[fieldParts[0]][fieldParts[1]] = updateFields[fieldParts[0]][fieldParts[1]];
            }
        });
    }

    await taskList.save(); // Сохраняем в базе привычку

    return habit;
};

export const updateHabit = async (req, res) => {
    try {
        const user_id = req.userId; //получения id через midllware из расшифрованного токена 
        const { habitId } = req.params;
        const updates = req.body;

        // Обновляем привычку с помощью findAndModifyHabit
        const updatedHabit = await findAndModifyHabit(user_id, habitId, updates);
        // console.log("Данные для обновления привычки ", updates);

        res.json({
            message: 'Привычка успешно обновлена',
            habit: updatedHabit
        });
    } catch (err) {
        res.status(500).json({
            message: 'Не удалось обновить привычку',
        });
        console.log("Ошибка", err);
    }
};


const getUserAndHabitList = async (userId, habitId) => { //вспомогательная функция
    // Проверка валидности ObjectId пользователя и привычки (если необходимо)
    // if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(habitId)) {
    //     throw new Error("Некорректный идентификатор пользователя или привычки");
    // }

    // Проверка наличия пользователя
    const user = await UserModel.findById(userId);
    if (!user) {
        throw new Error("Пользователь не найден");
    }

    // Найти список задач и привычек пользователя
    const taskList = await TaskListModel.findOne({ user_id: userId });
    if (!taskList) {
        throw new Error("Список задач и привычек пользователя не найден");
    }

    // Найти привычку по id
    const habit = taskList.habits.id(habitId);
    if (!habit) {
        throw new Error("Привычка не найдена");
    }

    return { user, taskList, habit };
};

export const getOneHabit = async (req, res) => {
    try {
        //НО ЕСЛИ БУДЕТ ПОЛУЧАТЬ ПРИВЫЧКУ ДРУГОЙ ЮЗЕР, НАДО ПЕРЕДЕЛАТЬ ТОГДА
        //ТО ЕСТЬ МЫ ЗАШЛИ НА СТРАНИЦУ К ПОЛЬЗОВАТЕЛЮ И МОЖЕМ ID ЗАБРАТЬ ИЗ URL ТОГДА req.params
        //const { user_id, habitId } = req.params;
        //т.к. удаляет привычку только авторизованный пользователь, то при проверке checkAuth мы имеем уже id пользвоателя
        const user_id = req.userId;
        const habitId = req.params.id;

        console.log('ID привычки из URL:', habitId);
        console.log('ID пользователя из middleware:', user_id);

        const { habit } = await getUserAndHabitList(user_id, habitId);

        res.json({
            success: true,
            habit: habit
        });
    } catch (err) {
        console.error("Ошибка при получении привычки:", err.message);
        res.status(500).json({
            message: err.message || 'Не удалось получить привычку',
        });
    }
};

export const deleteOneHabit = async (req, res) => {
    try {
        //т.к. удаляет привычку только авторизованный пользователь, то при проверке checkAuth мы имеем уже id пользвоателя
        const user_id = req.userId;
        const habitId = req.params.id;

        console.log('ID привычки из URL:', habitId);
        console.log('ID пользователя из middleware:', user_id);

        const { taskList, habit } = await getUserAndHabitList(user_id, habitId);

        // Удаление привычки
        taskList.habits.pull(habitId);
        await taskList.save();

        res.json({
            success: true,
            message: 'Привычка успешно удалена',
        });
    } catch (err) {
        console.error("Ошибка при удалении привычки:", err.message);
        res.status(500).json({
            message: err.message || 'Не удалось удалить привычку',
        });
    }
};

//получить все привычки
export const getAllHabits = async (req, res) => {
    try {
        const user_id = req.userId; // Получаем id пользователя из middleware авторизации
        //или если без проверки авторизации через url 
        //const { user_id, habitId } = req.params;
        // Найти пользователя
        const user = await UserModel.findById(user_id);
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        // Найти список привычек пользователя
        const taskList = await TaskListModel.findOne({ user_id });
        if (!taskList) {
            throw new Error('Список задач пользователя не найден');
        }

        // Вернуть список привычек
        res.json({
            success: true,
            habits: taskList.habits
        });
    } catch (error) {
        console.error('Ошибка при получении привычек пользователя:', error.message);
        res.status(500).json({
            message: 'Не удалось получить привычки пользователя',
            error: error.message
        });
    }
};


//Обновление количественного прогресса
export const updateQuantitativeProgress = async (req, res) => {
    try {
        const habitId = req.params.id;
        const { date, progress } = req.body; // дата и прогресс
        const userId = req.userId; // Получаем id пользователя из middleware авторизации

        const { habit, taskList } = await getUserAndHabitList(userId, habitId); //taskList это и все (задачи, привычки, встречи)
       
        // Проверка, существует ли уже запись с такой датой
        const existingProgress = habit.statistics_goal.progress_data.find(prog => 
            new Date(prog.date).toDateString() === new Date(date).toDateString()
        );
        console.log("Существует в базе уже дата с прогрессом? ", existingProgress);

        if (existingProgress) {
            // Если прогресс уже существует, удалить запись
            habit.statistics_goal.progress_data = habit.statistics_goal.progress_data.filter(prog => 
                new Date(prog.date).toDateString() !== new Date(date).toDateString()
            );
        } else {
            // Добавление новой записи, если прогресс больше нуля
            habit.statistics_goal.progress_data.push({ date });
        }

        // Обновление статистики цели
        habit.statistics_goal.total_units = habit.statistics_goal.progress_data.length * progress;
        habit.statistics_goal.days_completed = habit.statistics_goal.progress_data.length;

        // в базе модели есть проверка на достижение цели и в случае достижения устанавливается дата, когда цель достигнута
        // можно проверить и приоритетный тип цели (дни или единицы), но пока уберу
        // на фронтенде можно просто подсветить зеленым, когда цель будет достигнута, но вторая цель тоже должна датой зафиксироваться
        if (habit.statistics_goal.total_units >= habit.goal.total_amount) { // if (habit.goal_type === 'units' && habit.statistics_goal.total_units >= habit.goal.total_amount) {
            habit.statistics_goal.goal_achieved_date_unit = habit.statistics_goal.goal_achieved_date_unit || new Date();
        } 
        console.log("Вот дата достижения цели по дням ", habit.statistics_goal.goal_achieved_date_day);
        if (habit.statistics_goal.days_completed >= habit.goal.days) {  // if (habit.goal_type === 'days' && habit.statistics_goal.days_completed >= habit.goal.days) {
            habit.statistics_goal.goal_achieved_date_day = habit.statistics_goal.goal_achieved_date_day || new Date(); //если дата уже была, поставим ту же дату
        }

        await taskList.save();

        res.status(200).json({ message: 'Прогресс обновлен', habit });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при обновлении прогресса', error });
    }
};

//Обновление прогресса "да/нет"
export const updateYesNoProgress = async (req, res) => {
    try {
        const habitId = req.params.id;
        const userId = req.userId; // Получаем id пользователя из middleware авторизации
        const { date } = req.body; // дата

        const { habit, taskList } = await getUserAndHabitList(userId, habitId);  //taskList это и все (задачи, привычки, встречи)

        // Проверка, существует ли уже запись с такой датой
        const existingProgress = habit.statistics_goal.progress_data.find(prog => 
            new Date(prog.date).toDateString() === new Date(date).toDateString()
        );

        if (existingProgress) {
            // Если прогресс уже существует, удалить запись
            habit.statistics_goal.progress_data = habit.statistics_goal.progress_data.filter(prog => 
                new Date(prog.date).toDateString() !== new Date(date).toDateString()
            );
        } else {
            // Добавление новой записи
            habit.statistics_goal.progress_data.push({ date });
        }

        // Обновление статистики цели
        habit.statistics_goal.days_completed = habit.statistics_goal.progress_data.length;

        if (habit.statistics_goal.days_completed >= habit.goal.days) {
            habit.statistics_goal.goal_achieved_date_day = new Date();
        }

        await taskList.save();

        res.status(200).json({ message: 'Прогресс обновлен', habit });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при обновлении прогресса', error });
    }
};



