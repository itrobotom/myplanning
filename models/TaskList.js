import mongoose from "mongoose";
// CommentSchema и ChatSchema: Созданы отдельные схемы для комментариев и чатов, которые могут быть переиспользованы в разных моделях.
// TaskSchema, HabitSchema, MeetingSchema: Отдельные схемы для задач, привычек и встреч, с полями, которые соответствуют JSON структуре.
// TaskListSchema: Основная схема, включающая все задачи, привычки и встречи, а также настройки приватности.

// Схема для комментариев
const CommentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  }
});

// Схема для чата задач/встреч/привычек
const ChatSchema = new mongoose.Schema({
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    }
});


// Схема для задач
const TaskSchema = new mongoose.Schema({
  creation_date: { //системная дата создания
    type: Date,
    default: Date.now,
  },
  //выполнить в конкретный день или до этого дня
  //если будет указано for_day то в плане на каждый день будет висеть задача, пока не отметим ее как выполненную
  //если выбран режим until_day, то repeat будет по дефолту как без повторения
  period: { 
    type: String,
    enum: ['in_day', 'until_day'],
  },
  repeat: {
    type: String,
    enum: ['every_day', 'every_week', 'every_month', 'specific_days'],
    default: function() {
      return this.period === 'until_day' ? 'none' : undefined;
    },
  },
  //Поле repeat теперь включает дополнительное значение specific_days, которое указывает, что задача должна выполняться в определенные дни недели.
  //Валидация поля days_of_week проверяет, что оно указано и содержит хотя бы один элемент, если repeat установлено в specific_days.
  days_of_week: {
    type: [String],
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    default: undefined,
    validate: {
      validator: function(v) {
        return this.repeat === 'specific_days' ? v && v.length > 0 : true;
      },
      message: 'days_of_week must be specified if repeat is "specific_days".'
    }
  },
  planned_end_date: { //планируемая дата окончания задачи
    type: Date,
  },
  actual_end_date: { //фактическая дата окончания задачи
    type: Date,
  },
  content: {         //содержание задачи
    type: String,
    required: true,
  },
//   privacy: {         
//     type: String,
//     enum: ['public', 'only_friends', 'private'],
//     default: 'private',
//   },
  category: {
    type: String,
    // Работа Учёба Досуг Спорт Семья Личное развитие Домашние дела Финансы Путешествия Здоровье
    enum: ['work', 'study', 'leisure', 'sports', 'family', 'personal_development', 'household', 'finance', 'travel', 'health'],
    default: 'work'
  },
  planned_time: { //сколько времени в минутах планируется на выполнение задачи
    type: Number,
  },
  actual_time: {  //сколько времени в минутах заняла задача
    type: Number,
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed'],
    default: 'in_progress',
  },
  comments: [CommentSchema],
  urls_images: [{
    type: String,
  }],
  like_count: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  view_count: {
    type: Number,
    default: 0,
  },
  task_chat: [ChatSchema]
});

// Схема для прогресса участников (привычки)
// const ProgressSchema = new mongoose.Schema({
//     user_id: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//     },
//     progress_value: {
//       type: Number,
//       required: true,
//     },
//     timestamp: {
//       type: Date,
//       default: Date.now,
//     }
// });

// Схема для привычек
const HabitSchema = new mongoose.Schema({
    creation_date: {
      type: Date,
      default: Date.now,
    },
    start_date: { // Дата начала привычки (может отличаться от создания и редактироваться позже)
      type: Date,
      required: true,
      default: Date.now,
    },
    content: { //название привычки
      type: String,
      required: true,
    },
    privacy: { //кто видит привычки
      type: String,
      enum: ['public', 'only_friends', 'private'],
      default: 'private',
    },
    //при выборе every_week будет поле осталось 6 дней, потом 5 и тд, а как выполнишь вместо осталось х дней будет готово, а с новой недели будет снова отсчет
    //every_month аналогично every_week
    //specific_days - выполненные дни будут подсвечены зеленым, которые надо выполнить синим, которые пропущены - красным
    //every_day - по аналогии с specific_days
    repeat: { //частота повторений привычки (график)
      type: String,
      enum: ['every_day', 'every_week', 'every_month', 'specific_days'],
    },
    days_of_week: { //дни недели, когда повторять привычку (при выборе specific_days)
      type: [String],
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      default: undefined,
      validate: {
        validator: function(v) {
          return this.repeat === 'specific_days' ? v && v.length > 0 : true;
        },
        message: 'days_of_week must be specified if repeat is "specific_days".'
      }
    },
    planned_time: { //запланированное время на выработку привычки
      type: Number,
    },
    actual_time: { //сколько дней уже вырабатываю привычку
      type: Number,
    },
    likes: [{ //кто лайкнул привычку
      user_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
      },
      nickName: {
          type: String,
          required: true,
      }
    }],
    
    //как определяется прогресс (фиксируются дни, когда соблюдалась привычка)
    //или измеримый прогресс в количестве
    progress_type: { 
      type: String,
      enum: ['yes/no', 'quantitative'], //измеримый или нет
      required: true,
    },

    // Моя цель может быть измеримой или не измеримой. Если она измеримая, просто добавится поле количество единиц в день выполнения привычки,  
    // соответственно добавится поле единиц измерений (повторов, минут, км и тд), поле, которое хранит общую сумму единиц за все дни, которое 
    // обновляется каждый раз, когда мы выполняем привычку (делаем отметку на фронтенде о дне выполнении или еще указываем количество единиц 
    // в случае измеримого вида). Если мы выбрали измеримую привычку, то надо выбрать один из двух режимов: достичь нужное количество единиц, 
    // или выполнять нужное количество дней привычку. Но в аналитике еще будет информация о количестве повторов в сумме.  
    goal_type: { //тип для измеримой цели (общее количество или дней соблюдения)
      type: String,
      enum: ['units', 'days'],
      default: 'units',
      validate: {
          validator: function(v) {
              return this.progress === 'quantitative' ? v !== null : true;
          },
          message: 'goal_type must be specified for "quantitative" progress.'
      }
    },
    
    goal: {  //цель
      //сколько дней буду вырабатывать привычку
      days: {
        type: Number,
        default: null,
        validate: {
            validator: function(v) {
                return this.progress === 'yes/no' ? v !== null : true;
            },
            message: 'Цель должна содержать количество дней для типа прогресса "yes/no".'
        }
      },
      // однократная (ежедневная) сумма (повторений)
      daily_amount: {
        type: Number,
        default: null,
        validate: {
            validator: function(v) {
                return this.progress === 'quantitative' ? v !== null : true;
            },
            message: 'Цель должна содержать ежедневное количество для типа прогресса "quantitative".'
        }
      },
      //общая сумма (сколько повторов повторений или времени в холодном душе и тд)
      total_amount: {
        type: Number,
        default: null,
        validate: {
            validator: function(v) {
                return this.progress === 'quantitative' ? v !== null : true;
            },
            message: 'Цель должна содержать общее количество для типа прогресса "quantitative".'
        }
      },
      //единицы измерения (повторы, км, минуты, страницы и тд)
      unit: {
        type: String,
        default: null,
        validate: {
            validator: function(v) {
                return this.progress === 'quantitative' ? v !== null : true;
            },
            message: 'Цель должна содержать единицу измерения для типа прогресса "quantitative".'
        }
      },
      notes: { //примечания
          type: String,
          default: null,
      }
    },
    statistics_goal: { //статистика по выполнению цели
      progress_data: [{ // данные прогресса (должен быть массив дат) 
        date: {
          type: Date,
          default: null, //когда создадим привычку, это поле еще будет пустым
        }
      }],
      days_completed: { //сколько дней уже выполнено
          type: Number,
          default: 0,
      },
      total_units: {   //сколько единиц выполнено за все время
          type: Number,
          default: 0,
      },
      goal_achieved_date_day: { //дата достижения цели по количеству дней
          type: Date,
          default: null,
      },
      goal_achieved_date_unit: { //дата достижения цели по повторам единиц (км, страниц, минут и тд)
        type: Date,
        default: null,
      }
    },

    categories: [{ //категория привычек можно СДЕЛАТЬ ENUM из возможных вариантво 
      type: String,
    }],
});

// Middleware для обновления дат достижения цели автоматически будет обновлять даты достижения цели, если они были достигнуты.
// первая дата, которая будет отмечена в цели, останется даже если будем продолжать отмечать прогресс
// HabitSchema.pre('save', function(next) {
//   console.log('total_units:', this.statistics_goal.total_units, 'goal_total_amount:', this.goal.total_amount);
//   console.log('days_completed:', this.statistics_goal.days_completed, 'goal_days:', this.goal.days);
//   // Проверка для количественной цели
//   if (this.goal_type === 'units' && this.statistics_goal.total_units >= this.goal.total_amount) {
//       this.statistics_goal.goal_achieved_date_unit = this.statistics_goal.goal_achieved_date_unit || new Date();
//   }
//   // Проверка для цели по дням
//   if (this.goal_type === 'days' && this.statistics_goal.days_completed >= this.goal.days) {
//       this.statistics_goal.goal_achieved_date_day = this.statistics_goal.goal_achieved_date_day || new Date();
//   }
//   next();
// });






// Схема для голосования за дату и время встречи
const VoteOptionSchema = new mongoose.Schema({
    date: {
      type: Date,
      required: true,
    },
    votes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }]
});

// Поле specific_friends в MeetingSchema: добавлено для указания конкретных друзей, которые могут видеть событие, если privacy установлено в specific_friends.
// Поле participants в MeetingSchema: добавлено для хранения списка пользователей, участвующих во встрече.
// Схема VoteOptionSchema: добавлена для организации голосования за даты и время встречи. Это позволяет создать несколько
// Схема для встреч
const MeetingSchema = new mongoose.Schema({
    creation_date: {
      type: Date,
      default: Date.now,
    },
    content: {
      type: String,
      required: true,
    },
    privacy: { //кто видит созданную всречу 
      type: String,
      enum: ['public', 'only_friends', 'private', 'specific_friends'],
      default: 'private',
    },
    specific_friends: [{ //список друзей, кто видит встречу 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    shared_with: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    planned_time: {
      type: Number,
    },
    actual_time: {
      type: Number,
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
    },
    comments: [CommentSchema],
    urls_images: [{
      type: String,
    }],
    like_count: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    view_count: {
      type: Number,
      default: 0,
    },
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    vote_options: [VoteOptionSchema],
    meeting_chat: [ChatSchema]
});


// Основная схема для списка задач, привычек и встреч
const TaskListSchema = new mongoose.Schema({
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    privacy_settings: {
      tasks: {
        type: String,
        enum: ['public', 'only_friends', 'private'],
        default: 'private',
      },
      habits: {
        type: String,
        enum: ['public', 'only_friends', 'private'],
        default: 'private',
      },
      meetings: {
        type: String,
        enum: ['public', 'only_friends', 'private'],
        default: 'private',
      },
    },
    tasks: [TaskSchema],
    my_pattern_tasks: [TaskSchema],
    pattern_tasks: [TaskSchema],
    habits: [HabitSchema],
    meetings: [MeetingSchema]
  }, {
    timestamps: true, // для автоматического добавления полей createdAt и updatedAt
});
  
// Ограничение количества участников на уровне базы данных
TaskListSchema.index({ 'habits.participants': 1 }, { unique: true, partialFilterExpression: { 'habits.participants': { $size: 100 } } });

export default mongoose.model('TaskList', TaskListSchema);


// МОЖНО ЗАПИЛИТЬ УЧАСТИЕ ВО ВСТРЕЧЕ НЕ ЗАРЕГАННЫХ ПОЛЬЗОВАТЕЛЕЙ, ТОГДА
// Это отдельная схема, описывающая участников встречи, включая незарегистрированных пользователей.
// Поле guest_name используется для хранения имени незарегистрированного участника.
// is_registered указывает, зарегистрирован ли пользователь в системе или нет.
// Поле participants в MeetingSchema:

// Теперь использует ParticipantSchema для хранения всех участников встречи (зарегистрированных и незарегистрированных).
// Метод checkAccessCode:

// Остается тем же, что и раньше, для проверки правильности введенного кода доступа.
// Логика использования:
// При создании встречи вы создаете код доступа (access_code). Незарегистрированные пользователи, желающие принять участие во встрече, должны будут ввести этот код доступа и указать свои имя и фамилию (поле guest_name). Их данные сохраняются в массиве participants в объекте встречи.

// При голосовании за время встречи (используя VoteOptionSchema), вам нужно будет управлять голосами, включая голоса от незарегистрированных участников. Это позволит отслеживать, кто голосовал за какие варианты времени.

// Такой подход позволяет полноценно управлять участниками встречи, включая незарегистрированных пользователей, и отслеживать их действия в контексте встречи.

// Схема для голосования за дату и время
// const VoteOptionSchema = new mongoose.Schema({
//     date: {
//       type: Date,
//       required: true,
//     },
//     votes: [{
//       user_id: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//       },
//       guest_name: {
//         type: String,
//         required: true,
//       }
//     }]
//   });
  
//   // Схема для участников встречи (включая незарегистрированных)
//   const ParticipantSchema = new mongoose.Schema({
//     user_id: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//     },
//     guest_name: {
//       type: String,
//       required: true,
//     },
//     is_registered: {
//       type: Boolean,
//       default: false,
//     },
//     start_date: {
//       type: Date,
//       default: Date.now,
//     },
//     progress: [ProgressSchema]
//   });
  
//   // Схема для встреч
//   const MeetingSchema = new mongoose.Schema({
//     creation_date: {
//       type: Date,
//       default: Date.now,
//     },
//     content: {
//       type: String,
//       required: true,
//     },
//     privacy: {
//       type: String,
//       enum: ['public', 'only_friends', 'private', 'specific_friends'],
//       default: 'private',
//     },
//     specific_friends: [{
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//     }],
//     access_code: {
//       type: String,
//       required: true, // Необходимо ввести код доступа для участия во встрече
//     },
//     planned_time: {
//       type: Number,
//     },
//     actual_time: {
//       type: Number,
//     },
//     priority: {
//       type: String,
//       enum: ['high', 'medium', 'low'],
//     },
//     comments: [CommentSchema],
//     urls_images: [{
//       type: String,
//     }],
//     like_count: [{
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//     }],
//     view_count: {
//       type: Number,
//       default: 0,
//     },
//     participants: [ParticipantSchema], // Включает зарегистрированных и незарегистрированных участников
//     vote_options: [VoteOptionSchema],
//     meeting_chat: [ChatSchema]
//   });
  
//   // Метод для проверки кода доступа
//   MeetingSchema.methods.checkAccessCode = function(code) {
//     return this.access_code === code;
//   };
  
//   export default mongoose.model('Meeting', MeetingSchema);
  


// Схема для привычек ПОЛНАЯ ПЕРВАЯ ВЕРСИЯ
// const HabitSchema = new mongoose.Schema({
//     creation_date: {
//       type: Date,
//       default: Date.now,
//     },
//     content: {
//       type: String,
//       required: true,
//     },
//     privacy: {
//       type: String,
//       enum: ['public', 'only_friends', 'private'],
//       default: 'private',
//     },
//     shared_with: [{ //кому доступна? или кто тоже учавствует в формировании привычки
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//     }],
//     // period: { //??
//     //   type: String,
//     //   enum: ['in_day', 'in_week', 'in_month'],
//     // },
//     repeat: { //частота повторений привычки
//       type: String,
//       enum: ['every_day', 'every_week', 'every_month', 'specific_days'],
//     },
//     days_of_week: { //дни недели, когда повторять привычку
//       type: [String],
//       enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
//       default: undefined,
//       validate: {
//         validator: function(v) {
//           return this.repeat === 'specific_days' ? v && v.length > 0 : true;
//         },
//         message: 'days_of_week must be specified if repeat is "specific_days".'
//       }
//     },
//     planned_time: { //запланированное время на выработку привычки
//       type: Number,
//     },
//     actual_time: { //сколько дней уже вырабатываю привычку
//       type: Number,
//     },
//     // priority: { //приоритет привычки, на всякий случай
//     //   type: String,
//     //   enum: ['high', 'medium', 'low'],
//     // },
//     comments: [CommentSchema],
//     urls_images: [{
//       type: String,
//     }],
//     like_count: [{
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//     }],
//     view_count: {
//       type: Number,
//       default: 0,
//     },
//     progress: { //тип прогресса, от него зависит измеримая привычки или не измеримая
//       type: String,
//       enum: ['yes/no', 'quantitative'], // Тип прогресса: да/нет или количественный
//     },
//     participants: [{ //участники, кто вступил в челлендж по формированию привычки вместе
//       user_id: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true,
//       },
//       start_date: { //дата вступления участника в челлендж
//         type: Date,
//         default: Date.now,
//       },
//       progress: [ProgressSchema] //прогресс участника
//     }],
//     author_id: { //автор привычки всегда должен указан у всех, кто участвует в челлендже
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//     },
//     goal: { //цель
//       days: {         //сколько дней буду вырабатывать привычку
//         type: Number,
//         default: null,
//       },
//       daily_amount: { // однократная (ежедневная) сумма (повторений)
//         type: Number,
//         default: null,
//       },
//       total_amount: { //общая сумма (сколько повторов повторений или времени в холодном душе и тд)
//         type: Number,
//         default: null,
//       },
//       unit: { //единицы
//         type: String,
//         default: null,
//       },
//       notes: { //примечания
//         type: String,
//         default: null,
//       }
//     },
//     habit_chat: [ChatSchema] // Добавлено поле для чата привычек
// });