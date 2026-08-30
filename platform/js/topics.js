/* ============================================================================
 * topics.js — 主题数据：每个主题含骨架代码、步骤化提示、可选代码片段
 * ============================================================================
 * 数据形状:
 *   {
 *     id, title, language: 'cpp'|'c', difficulty, description, goal,
 *     skeleton,                                          // 用户看到的初始代码
 *     steps: [                                           // 顺序提示节点
 *       { line, title, explain, options:[{label, code}], match, hint }
 *     ],
 *     pitfalls: [ ... ],                                 // 审查规则补充
 *     stretch:[ ... ]                                    // 拓展挑战
 *   }
 * ========================================================================== */

window.CPP_TOPICS = [
  {
    id: "hello-world",
    title: "第 1 关：你好，世界",
    language: "cpp",
    difficulty: "入门",
    description:
      "几乎所有程序员的第一个程序。本关我们会写出能跟你打招呼的代码。",
    goal: "让程序输出 你好 + 你的名字",
    skeleton: `// 在这里写下你的第一行 C++ 代码
// 目标：编译并运行后，屏幕上能看到你的名字

int main() {
    // TODO: 在这里写入输出语句

    return 0;
}
`,
    steps: [
      {
        line: 1,
        title: "1. 引入输入输出库",
        explain:
          "C++ 标准库把常用的输入输出功能都放在 <iostream> 里。" +
          "iostream = input + output stream。",
        options: [
          { label: "推荐 · C++ 风格", code: "#include <iostream>" },
          { label: "备选 · C 兼容写法", code: "#include <stdio.h>" },
        ],
        match: /#include\s*<(iostream|stdio\.h)>/,
        hint: "如果代码里出现 #include <iostream>，这一步就完成了 ✅",
      },
      {
        line: 6,
        title: "2. 告诉编译器我们要用 std 命名空间",
        explain:
          "cout 这个名字藏在 std 命名空间里。你可以一行 'using namespace std;' 全部解锁，"
          + "但工业项目更推荐每次写 std::cout — 这是一个好习惯开关。",
        options: [
          {
            label: "简单 · 全局引用（小白阶段够用）",
            code: "using namespace std;",
          },
          {
            label: "严谨 · 不引用，每次写 std:: 前缀",
            code: "// 暂不写 using，下面直接用 std::cout",
          },
        ],
        match: /(using\s+namespace\s+std;|std::cout)/,
        hint: "出现 'using namespace std;' 或者代码里直接写 std::cout 即可",
      },
      {
        line: 8,
        title: "3. 写出输出语句",
        explain:
          "cout 是 console output 的缩写，<< 想象成 '把右边的东西塞到左边的流里'。"
          + "endl 表示换行并刷新输出缓冲区。",
        options: [
          { label: "用 endl 换行", code: 'cout << "你好，世界" << endl;' },
          { label: "用 \\n 换行", code: 'cout << "你好，世界\\n";' },
        ],
        match: /cout\s*<<\s*"你好/,
        hint: "出现 'cout << \"你好' 这种字样就过关",
      },
      {
        line: 8,
        title: "4. 加上自己的名字",
        explain: '把 "你好，世界" 改成 "你好，<你的名字>" 让程序有个人色彩。',
        options: [
          { label: '改成 "你好，阿明"', code: 'cout << "你好，阿明" << endl;' },
          { label: '改成 "Hello, World"（英文经典）', code: 'cout << "Hello, World" << endl;' },
        ],
        match: /你好|Hello/i,
        hint: "把你代码里的字符串替换成你想要的任意文本",
      },
    ],
    pitfalls: [
      "忘记在字符串两端写英文双引号",
      '用中文全角的分号 ；，编译器只认英文的 ;',
      'endl 写错成 end1 (字母 l 写成数字 1)',
    ],
    stretch: [
      "把字符串改成 '我的名字 + 今天日期'",
      "再输出一次你的年龄，验证 C++ 算术",
      "把 endl 换成 '\\t' 试试看输出会怎样",
    ],
  },

  {
    id: "variables-and-io",
    title: "第 2 关：变量与输入",
    language: "cpp",
    difficulty: "入门",
    description:
      "程序不只是输出固定文字。我们要让程序跟用户对话 —— 输入名字、打招呼。",
    goal: "让程序读取用户输入的年龄，并告诉他明年多大",
    skeleton: `// 读取用户输入并回显
#include <iostream>

int main() {
    // TODO 1: 声明一个变量来装年龄 (int age;)

    // TODO 2: 提示用户输入年龄

    // TODO 3: 用 cin 读取用户输入

    // TODO 4: 输出明年用户的年龄

    return 0;
}
`,
    steps: [
      {
        line: 6,
        title: "1. 声明变量",
        explain:
          "int age; 表示 '向系统申请一块叫 age 的内存，用来装整数'。"
          + "声明之后再赋值才安全。",
        options: [
          { label: "声明一个年龄变量", code: "int age;" },
          { label: "声明 + 同时赋值", code: "int age = 18;" },
        ],
        match: /int\s+age\b/,
        hint: "出现 'int age' 字样即可",
      },
      {
        line: 8,
        title: "2. 提示用户输入",
        explain:
          "好的程序先告诉用户要做什么。用 cout 加上提示文字。",
        options: [
          { label: "友好提示", code: 'std::cout << "请输入你的年龄: ";' },
          { label: "极简提示", code: 'std::cout << "Age: ";' },
        ],
        match: /cout\s*<<\s*"[^"]*年龄|cout\s*<<\s*"[^"]*Age/i,
        hint: "出现包含 '年龄' 或 'Age' 的输出语句即可",
      },
      {
        line: 10,
        title: "3. 读取用户输入",
        explain:
          "cin >> age; 表示 '从标准输入读一个整数塞进 age'。"
          + ">> 方向跟 << 相反：cin >> age, 数据从 cin 流进 age。",
        options: [
          { label: "标准写法", code: "std::cin >> age;" },
          { label: "加了 using namespace 后的简写", code: "cin >> age;" },
        ],
        match: /cin\s*>>\s*age\b/,
        hint: "出现 'cin >> age' 即完成",
      },
      {
        line: 12,
        title: "4. 输出明年年龄",
        explain:
          "age + 1 就是明年年龄。如果想写得优雅可以用 (age + 1) 包一下。",
        options: [
          { label: "直接相加", code: 'std::cout << "明年你 " << age + 1 << " 岁" << std::endl;' },
          { label: "先算再输出", code: "int next = age + 1;\nstd::cout << \"明年你 \" << next << \" 岁\" << std::endl;" },
        ],
        match: /age\s*\+\s*1|next\s*=|age\s*\+\s*1/,
        hint: "出现 'age + 1' 字样即完成",
      },
    ],
    pitfalls: [
      "声明变量忘记分号 int age",
      "cin >> age 写错方向为 <<",
      "忘了 #include <iostream>",
    ],
    stretch: [
      "改成读取姓名（用 string 类型）+ 年龄，打印一句话",
      "加入 if (age >= 18) 判断成年人",
      "用 std::getline 读一整行输入",
    ],
  },

  {
    id: "guess-number",
    title: "第 3 关：猜数字游戏",
    language: "cpp",
    difficulty: "进阶",
    description:
      "综合使用：随机数 + while 循环 + if 判断 + cin/cout，做一个迷你游戏。",
    goal: "让程序随机生成 1-100 的数字，用户最多猜 7 次",
    skeleton: `// 猜数字游戏雏形
#include <iostream>
#include <cstdlib>   // rand(), srand()
#include <ctime>     // time()

int main() {
    srand(time(0));                          // 用当前时间当随机种子
    int secret = rand() % 100 + 1;            // 1 ~ 100
    int guess = 0;
    int tries = 0;

    // TODO: 用 while 循环让用户猜，最多 7 次
    // 如果猜中：打印 "恭喜你，猜对了！" 并退出
    // 如果猜错：提示 "太大" 或 "太小"
    // 用完 7 次：打印 "游戏结束，正确答案是 X"

    return 0;
}
`,
    steps: [
      {
        line: 12,
        title: "1. 写出循环条件",
        explain:
          "我们用 while 同时满足两个条件：1) 次数还没用完 2) 还没猜对。两个条件用 && 连接。",
        options: [
          { label: "经典写法", code: "while (tries < 7 && guess != secret) {" },
          { label: "while(true) + break", code: "while (true) {\n    if (tries >= 7) break;\n" },
        ],
        match: /while\s*\(/,
        hint: "出现 'while' 关键字即完成这一步",
      },
      {
        line: 14,
        title: "2. 读取玩家输入",
        explain: "每次循环都要读一次。tries++ 让计数器自增。",
        options: [
          { label: "标准", code: "std::cin >> guess;\n        tries++;" },
          { label: "注释版（更易读）", code: "std::cin >> guess;       // 读一个整数\n        tries++;            // 计数" },
        ],
        match: /cin\s*>>\s*guess/,
        hint: "出现 'cin >> guess' 即完成",
      },
      {
        line: 18,
        title: "3. 大小比较并提示",
        explain:
          "if / else if 把 guess 和 secret 比一比，给玩家反馈。",
        options: [
          { label: "三分支标准", code: 'if (guess > secret) std::cout << "太大" << std::endl;\n        else if (guess < secret) std::cout << "太小" << std::endl;\n        else std::cout << "恭喜你，猜对了！" << std::endl;' },
          { label: "更易读（拆成多行）", code: "if (guess > secret) {\n            std::cout << \"太大\" << std::endl;\n        } else if (guess < secret) {\n            std::cout << \"太小\" << std::endl;\n        } else {\n            std::cout << \"恭喜你，猜对了！\" << std::endl;\n        }" },
        ],
        match: /if\s*\(.*guess/,
        hint: "出现 'if (guess ...)' 字样即完成",
      },
    ],
    pitfalls: [
      "rand() % 100 + 1 写漏 + 1 导致只能猜 0-99",
      "忘记 srand(time(0))，每次随机都一样",
      "while 死循环：条件忘 ++ 或 break",
    ],
    stretch: [
      "改成最多 10 次机会",
      "猜中后问玩家是否再玩一局",
      "用二分法写个 AI 自动猜",
    ],
  },

  {
    id: "robotic-arm-fk",
    title: "第 4 关：机械臂正运动学（2 连杆）",
    language: "cpp",
    difficulty: "挑战",
    description:
      "用 C++ 写一个 2 连杆机械臂的正运动学函数：已知关节角度，求末端坐标。这是机器人入门的经典。",
    goal: "实现一个 forwardKinematics(theta1, theta2) 返回 (x, y)",
    skeleton: `// 2 连杆机械臂正运动学
// 关节长度 L1, L2 都是 1.0
#include <cmath>
#include <iostream>
#include <utility>   // std::pair

std::pair<double, double> forwardKinematics(double theta1, double theta2) {
    // TODO: 根据公式：
    //   x = L1*cos(theta1) + L2*cos(theta1 + theta2)
    //   y = L1*sin(theta1) + L2*sin(theta1 + theta2)
    // 返回一个 pair

    return {0.0, 0.0};  // 占位，记得替换
}

int main() {
    // 测试：theta1 = 30度, theta2 = 60度
    double t1 = 30.0 * M_PI / 180.0;
    double t2 = 60.0 * M_PI / 180.0;

    auto [x, y] = forwardKinematics(t1, t2);

    std::cout << "末端坐标: (" << x << ", " << y << ")" << std::endl;
    return 0;
}
`,
    steps: [
      {
        line: 7,
        title: "1. 算出末端 x 坐标",
        explain:
          "x = L1*cos(theta1) + L2*cos(theta1 + theta2)。记住把角度代入 cos 之前要单位转换。",
        options: [
          { label: "直接写公式", code: "double x = 1.0 * std::cos(theta1) + 1.0 * std::cos(theta1 + theta2);" },
          { label: "用 constexpr 改 L1, L2", code: "constexpr double L1 = 1.0, L2 = 1.0;\n    double x = L1 * std::cos(theta1) + L2 * std::cos(theta1 + theta2);" },
        ],
        match: /double\s+x\s*=.*cos/,
        hint: "出现包含 cos 的 x 赋值即完成",
      },
      {
        line: 9,
        title: "2. 算出末端 y 坐标",
        explain: "把 cos 换成 sin，其它跟 x 完全对称。",
        options: [
          { label: "对称写法", code: "double y = 1.0 * std::sin(theta1) + 1.0 * std::sin(theta1 + theta2);" },
        ],
        match: /double\s+y\s*=.*sin/,
        hint: "出现包含 sin 的 y 赋值即完成",
      },
      {
        line: 11,
        title: "3. 返回结果",
        explain: "用 return {x, y}; 直接返回 pair。简洁！",
        options: [
          { label: "大括号初始化", code: "return {x, y};" },
          { label: "std::make_pair", code: "return std::make_pair(x, y);" },
        ],
        match: /return\s*\{[^}]*x[^}]*y/,
        hint: "出现 'return {x, y}' 或 'make_pair(x, y)' 即完成",
      },
    ],
    pitfalls: [
      "忘 #include <cmath>，找不到 std::cos",
      "角度直接代入 cos：必须先乘 M_PI/180 转弧度",
      "忘了 M_PI 在新版 C++ 已经被移除，要自己定义常量",
    ],
    stretch: [
      "把 L1, L2 做成参数，让它能算任意 2 连杆",
      "加 IK（逆运动学）：给末端坐标反求角度",
      "用 struct 封装 Pose {double x, y;}",
    ],
  },
];
