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

  // ═══════════════════════════════════════════════════════════════════════
  //  Phase 2 新增主题（指针 / STL / 模板 / 文件 I/O / 链表 / 递归）
  // ═══════════════════════════════════════════════════════════════════════

  {
    id: "pointers-basics",
    title: "第 5 关：指针入门",
    language: "cpp",
    difficulty: "进阶",
    description:
      "C/C++ 最具特色也最容易出错的特性：指针。本关学会声明、解引用、修改原值。",
    goal: "通过指针修改变量值，理解 & 和 * 的含义",
    skeleton: `// 指针三件套：声明、取地址、解引用
#include <iostream>

int main() {
    int x = 42;
    // TODO 1: 声明指针 p 指向 x

    // TODO 2: 输出 p 和 *p，验证指针存的是地址

    // TODO 3: 用 *p 把 x 改成 100，然后输出 x

    return 0;
}
`,
    steps: [
      {
        line: 7,
        title: "1. 声明指针",
        explain:
          "指针变量的类型 = 指向对象的类型 + 星号。'int* p;' 表示 p 指向一个 int。"
          + "注意此时 p 还没指向任何东西，是 '野指针'，下一步让它指向 x。",
        options: [
          { label: "标准写法", code: "int* p = &x;" },
          { label: "分开声明 + 赋值", code: "int* p;\n    p = &x;" },
        ],
        match: /int\s*\*\s*p\s*=\s*&x|p\s*=\s*&x/,
        hint: "出现 'int* p = &x' 或 'p = &x' 即完成",
      },
      {
        line: 10,
        title: "2. 打印指针和解引用",
        explain:
          "p 存的是地址（数字），*p 是 '通过地址找到那个 int'，也就是 x 的值。",
        options: [
          { label: "一次打印两个", code: 'std::cout << "p=" << p << " *p=" << *p << std::endl;' },
          { label: "两行分开", code: 'std::cout << "p=" << p << std::endl;\n    std::cout << "*p=" << *p << std::endl;' },
        ],
        match: /cout\s*<<[^;]*\*p/,
        hint: "出现 '*p' 的输出语句即完成",
      },
      {
        line: 13,
        title: "3. 通过指针改 x",
        explain:
          "'*p = 100' 不是改 p，是改 'p 指向的那块内存'，也就是 x。"
          + "改完后 x 真的变成 100，p 自己不变。",
        options: [
          { label: "赋值 + 打印", code: "*p = 100;\n    std::cout << \"x=\" << x << std::endl;" },
          { label: "改用 const 风格", code: "*p = 100;  // 等价于 x = 100\n    std::cout << \"x 现在是 \" << x << std::endl;" },
        ],
        match: /\*p\s*=\s*100/,
        hint: "出现 '*p = 100' 即完成",
      },
    ],
    pitfalls: [
      "int* p; 没初始化就解引用 → 段错误",
      "把 *p = 100 写成 p = 100（丢了星号，p 变成地址 100）",
      "混淆 &x（取地址）和 *p（解引用）",
    ],
    stretch: [
      "声明一个指针数组",
      "用指针交换两个数（经典的 swap 函数）",
      "指向常量的指针：const int* p;",
    ],
  },

  {
    id: "stl-vector",
    title: "第 6 关：STL vector 与 string",
    language: "cpp",
    difficulty: "进阶",
    description:
      "告别手写数组，用 std::vector 装一组数，用 std::string 装一段文字。",
    goal: "用 vector<string> 存一组同学名字，然后找出最长那个",
    skeleton: `// STL 入门：vector + string
#include <iostream>
#include <vector>
#include <string>

int main() {
    // TODO 1: 创建一个 vector<string> 叫 names，初始化 3 个名字

    // TODO 2: 用 push_back 再加一个名字

    // TODO 3: 用范围 for 遍历并打印

    // TODO 4: 找出最长的名字

    return 0;
}
`,
    steps: [
      {
        line: 8,
        title: "1. 创建 vector",
        explain:
          "vector<string> 是 '可动态增长的 string 数组'。"
          + "用花括号初始化是 C++11 风格，比 C 风格数组友好得多。",
        options: [
          { label: "花括号初始化", code: 'std::vector<std::string> names = {"小明", "小红", "张三"};' },
          { label: "空 vector 后 push", code: "std::vector<std::string> names;" },
        ],
        match: /vector\s*<\s*std::string\s*>/,
        hint: "出现 'vector<std::string>' 即完成",
      },
      {
        line: 11,
        title: "2. push_back 添加元素",
        explain:
          "push_back 把元素追加到末尾，vector 会自动扩容，你不用关心容量。",
        options: [
          { label: "追加一个名字", code: 'names.push_back("李四");' },
          { label: "追加多个", code: 'names.push_back("李四");\n    names.push_back("王五");' },
        ],
        match: /names\.push_back\s*\(/,
        hint: "出现 'names.push_back(' 即完成",
      },
      {
        line: 14,
        title: "3. 范围 for 循环",
        explain:
          "'for (auto& n : names)' 是 C++11 引入的范围 for。"
          + "auto 让编译器自动推断类型，& 避免不必要的拷贝。",
        options: [
          { label: "标准写法", code: 'for (const auto& n : names) {\n        std::cout << n << std::endl;\n    }' },
          { label: "用 size_t 索引", code: "for (std::size_t i = 0; i < names.size(); ++i) {\n        std::cout << names[i] << std::endl;\n    }" },
        ],
        match: /for\s*\([^)]*names\s*\)/,
        hint: "出现 'for (... names ...)' 字样即完成",
      },
      {
        line: 17,
        title: "4. 找最长名字",
        explain:
          "用 size() 取字符串长度，用一个变量记住 '目前最长的'。"
          + "size_t 是无符号整数，专门表示大小。",
        options: [
          { label: "经典写法", code: 'std::string longest = names[0];\n    for (const auto& n : names) {\n        if (n.size() > longest.size()) longest = n;\n    }\n    std::cout << "最长: " << longest << std::endl;' },
          { label: "用 std::max_element", code: 'auto it = std::max_element(names.begin(), names.end(),\n        [](const std::string& a, const std::string& b){ return a.size() < b.size(); });\n    std::cout << "最长: " << *it << std::endl;' },
        ],
        match: /longest|std::max_element\s*\(/,
        hint: "出现 'longest' 变量或 'std::max_element' 即完成",
      },
    ],
    pitfalls: [
      "忘了 #include <vector> 或 <string>",
      "用 names[i] 时没检查 i < size()，越界未定义",
      "把 string 字面量 ('hello') 当 std::string 用 — 没事但要理解差异",
    ],
    stretch: [
      "改成读用户输入填入 vector",
      "用 std::sort 按名字长度排序",
      "用 std::map 统计每个名字出现次数",
    ],
  },

  {
    id: "templates",
    title: "第 7 关：函数模板",
    language: "cpp",
    difficulty: "进阶",
    description:
      "C++ 模板让你写一份代码，编译器自动生成 int 版、double 版、string 版。",
    goal: "写一个 maxOf(a, b) 函数模板，能比较任意可比较大小的类型",
    skeleton: `// 函数模板：让一个函数适配多种类型
#include <iostream>
#include <string>

// TODO: 写一个 maxOf 函数模板，返回两个中较大的那个
template <typename T>
T maxOf(T a, T b) {
    // TODO: 返回较大的
}

int main() {
    std::cout << maxOf(3, 7) << std::endl;          // 期望 7
    std::cout << maxOf(1.5, 2.5) << std::endl;       // 期望 2.5
    std::cout << maxOf(std::string("ab"), std::string("cd")) << std::endl;  // 期望 cd
    return 0;
}
`,
    steps: [
      {
        line: 5,
        title: "1. 模板声明",
        explain:
          "'template <typename T>' 让 T 在函数体里代表任意类型。"
          + "调用 maxOf(3, 7) 时编译器把 T 推断成 int，调用 maxOf('a','b') 时推断成 string。",
        options: [
          { label: "经典模板", code: "template <typename T>\nT maxOf(T a, T b) {" },
          { label: "加注释", code: "// T 是类型参数\ntemplate <typename T>\nT maxOf(T a, T b) {" },
        ],
        match: /template\s*<\s*typename\s+T\s*>/,
        hint: "出现 'template <typename T>' 即完成",
      },
      {
        line: 8,
        title: "2. 比较逻辑",
        explain:
          "C++ 里 'a < b' 对 int、double、string 都成立（因为它们都重载了 <）。"
          + "所以一份代码搞定所有类型。",
        options: [
          { label: "三元写法", code: "return a < b ? b : a;" },
          { label: "std::max", code: "return std::max(a, b);" },
        ],
        match: /return\s+[^;]*<\s*b|return\s+std::max/,
        hint: "出现 'return ... < b ...' 或 'std::max' 即完成",
      },
    ],
    pitfalls: [
      "比较自定义类型时忘了重载 operator<",
      "把 typename 写成 class（C++ 里两者等价但语境不同）",
      "用模板分离声明和定义时漏写 template 行",
    ],
    stretch: [
      "改成模板类",
      "加 concept 约束（T 必须支持 <）",
      "支持 initializer_list 的 maxOf({1,2,3,4,5})",
    ],
  },

  {
    id: "file-io",
    title: "第 8 关：文件 I/O",
    language: "cpp",
    difficulty: "进阶",
    description:
      "读写文件是程序与磁盘对话的方式。本关用 C++17 的 std::filesystem 列出当前目录的文件。",
    goal: "读取 notes.txt 的内容并打印，再写一行进去",
    skeleton: `// 文件 I/O：ifstream 读，ofstream 写
#include <iostream>
#include <fstream>
#include <string>

int main() {
    // TODO 1: 用 ifstream 打开 notes.txt

    // TODO 2: 逐行读取并打印

    // TODO 3: 用 ofstream 追加一行

    return 0;
}
`,
    steps: [
      {
        line: 8,
        title: "1. 打开文件",
        explain:
          "ifstream = input file stream。打开后用 is_open() 检查是否成功。"
          + "文件不存在或没权限都会让 is_open() 返回 false。",
        options: [
          { label: "经典写法", code: 'std::ifstream in("notes.txt");\n    if (!in.is_open()) { std::cerr << "打开失败" << std::endl; return 1; }' },
          { label: "极简（忽略错误）", code: 'std::ifstream in("notes.txt");' },
        ],
        match: /ifstream\s+\w+\s*\(\s*["']notes\.txt["']\s*\)/,
        hint: "出现打开 notes.txt 的 ifstream 即完成",
      },
      {
        line: 11,
        title: "2. 逐行读取",
        explain:
          "std::getline(in, line) 读一行（碰到 \\n 停下），返回流的 bool。"
          + "放在 while 条件里就是 '还有下一行就继续'。",
        options: [
          { label: "getline 写法", code: "std::string line;\n    while (std::getline(in, line)) {\n        std::cout << line << std::endl;\n    }" },
          { label: "用 >> 但只读第一个词", code: "std::string word;\n    while (in >> word) std::cout << word << std::endl;" },
        ],
        match: /std::getline\s*\(\s*in\s*,/,
        hint: "出现 'std::getline(in,' 即完成",
      },
      {
        line: 14,
        title: "3. 追加写一行",
        explain:
          "ofstream 默认是覆盖（truncate）。"
          + "用 std::ios::app 模式打开就是追加（append），原文保留。",
        options: [
          { label: "追加模式", code: 'std::ofstream out("notes.txt", std::ios::app);\n    out << "新的一行\\n";' },
          { label: "覆盖模式", code: 'std::ofstream out("notes.txt");\n    out << "完全覆盖\\n";' },
        ],
        match: /ofstream\s+\w+\s*\(\s*["']notes\.txt["']\s*,/,
        hint: "出现打开 notes.txt 的 ofstream 即完成",
      },
    ],
    pitfalls: [
      "忘了 #include <fstream>",
      "没检查 is_open()，文件不存在就读 — 流会处于失败状态",
      "用 ios::trunc（默认）以为在追加 — 内容全被清空",
    ],
    stretch: [
      "用 std::filesystem 列目录所有 .txt",
      "改成读 CSV 并解析",
      "用二进制模式读写结构体",
    ],
  },

  {
    id: "linked-list",
    title: "第 9 关：单链表",
    language: "cpp",
    difficulty: "挑战",
    description:
      "用 struct + 指针串起来的 '链'，是面试常客。本关实现 push_front 和 print。",
    goal: "实现一个 int 单链表的 push_front 和 print",
    skeleton: `// 单链表：用 next 指针把节点串起来
#include <iostream>

struct Node {
    int value;
    Node* next;
};

// TODO: 实现 push_front — 把新节点插到链表头部
void push_front(Node*& head, int v) {
    // TODO
}

// TODO: 实现 print — 遍历打印所有节点
void print(Node* head) {
    // TODO
}

int main() {
    Node* head = nullptr;
    push_front(head, 3);
    push_front(head, 2);
    push_front(head, 1);
    print(head);  // 期望输出: 1 2 3
    return 0;
}
`,
    steps: [
      {
        line: 11,
        title: "1. 申请新节点",
        explain:
          "push_front 第一步是 new 一个节点。注意 Node*& 是 '指针的引用'，"
          + "这样函数里改 head，外面的 head 也会跟着变。",
        options: [
          { label: "new 一个节点", code: "Node* node = new Node{v, head};\n    head = node;" },
          { label: "加注释版", code: "Node* node = new Node;     // 申请内存\n    node->value = v;       // 填值\n    node->next = head;     // 指向原 head\n    head = node;           // 更新 head" },
        ],
        match: /new\s+Node\s*[{(]/,
        hint: "出现 'new Node' 即完成",
      },
      {
        line: 17,
        title: "2. 遍历打印",
        explain:
          "用一个临时指针 cur 一路 next 走到 nullptr。"
          + "经典的 '链表遍历模式'，几乎所有链表题都用得上。",
        options: [
          { label: "while 循环", code: "for (Node* cur = head; cur != nullptr; cur = cur->next) {\n        std::cout << cur->value << \" \";\n    }\n    std::cout << std::endl;" },
          { label: "while + 箭头", code: "Node* cur = head;\n    while (cur != nullptr) {\n        std::cout << cur->value << \" \";\n        cur = cur->next;\n    }\n    std::cout << std::endl;" },
        ],
        match: /cur\s*=\s*cur->next|cur\s*!=\s*nullptr/,
        hint: "出现 'cur->next' 或 'cur != nullptr' 字样即完成",
      },
    ],
    pitfalls: [
      "new 出来的节点忘了 delete（内存泄漏）",
      "把 Node*& 写成 Node* — 改了 head 函数外面看不到",
      "遍历时漏判 nullptr，第一次就崩",
    ],
    stretch: [
      "加 push_back 和 pop_front",
      "实现反转链表",
      "实现 has_cycle（弗洛伊德判环）",
    ],
  },

  {
    id: "recursion",
    title: "第 10 关：递归",
    language: "cpp",
    difficulty: "挑战",
    description:
      "函数自己调用自己。递归的关键是 base case + 递推关系。",
    goal: "用递归实现 factorial(n) 和 fibonacci(n)",
    skeleton: `// 递归：自己调用自己
#include <iostream>

// TODO: 实现 factorial
int factorial(int n) {
    // TODO: 基础情况 + 递推
}

// TODO: 实现 fibonacci
int fibonacci(int n) {
    // TODO: 基础情况 + 递推
}

int main() {
    std::cout << "5! = " << factorial(5) << std::endl;       // 期望 120
    std::cout << "fib(10) = " << fibonacci(10) << std::endl; // 期望 55
    return 0;
}
`,
    steps: [
      {
        line: 5,
        title: "1. factorial 基础情况",
        explain:
          "递归必须有一个 '停下来的条件'（base case）。factorial(0) = 1。"
          + "然后 factorial(n) = n * factorial(n-1)。",
        options: [
          { label: "if (n <= 1)", code: "if (n <= 1) return 1;\n    return n * factorial(n - 1);" },
          { label: "if (n == 0)", code: "if (n == 0) return 1;\n    return n * factorial(n - 1);" },
        ],
        match: /factorial\s*\(\s*n\s*-\s*1\s*\)/,
        hint: "出现 'factorial(n - 1)' 字样即完成",
      },
      {
        line: 11,
        title: "2. fibonacci 基础情况",
        explain:
          "fib(0) = 0, fib(1) = 1, fib(n) = fib(n-1) + fib(n-2)。"
          + "注意这里有两个基础情况，因为每个数依赖前两个。",
        options: [
          { label: "标准写法", code: "if (n < 2) return n;\n    return fibonacci(n - 1) + fibonacci(n - 2);" },
          { label: "拆 if", code: "if (n == 0) return 0;\n    if (n == 1) return 1;\n    return fibonacci(n - 1) + fibonacci(n - 2);" },
        ],
        match: /fibonacci\s*\(\s*n\s*-\s*[12]\s*\)/,
        hint: "出现 'fibonacci(n - 1)' 或 'fibonacci(n - 2)' 即完成",
      },
    ],
    pitfalls: [
      "没有 base case — 无限递归直到栈溢出",
      "fibonacci 朴素版 O(2^n) 很慢，可以加 memoization",
      "混淆 n-1 和 n-2",
    ],
    stretch: [
      "用 memoization 优化 fibonacci 到 O(n)",
      "用递归实现汉诺塔",
      "用递归实现二叉树遍历",
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════
  //  Phase 7 高级主题（指针进阶 / STL 进阶 / 类与对象 / 智能指针 / 移动语义）
  // ═══════════════════════════════════════════════════════════════════════

  {
    id: "pointer-advanced",
    title: "第 11 关：指针进阶 — 二级指针与函数指针",
    language: "cpp",
    difficulty: "挑战",
    description:
      "指针也能指向指针。函数指针让你把函数当数据传来传去，C 里回调全是它干的。",
    goal: "实现一个 swap_ptr()（用二级指针）和一个 apply()（用函数指针）",
    skeleton: `// 二级指针 = 指向指针的指针
// 函数指针 = 指向函数的指针
#include <iostream>

// TODO 1: swap_ptr — 交换两个指针的指向
void swap_ptr(int*& a, int*& b) {
    // TODO
}

// TODO 2: apply — 用函数指针调用函数
int apply(int x, int (*op)(int)) {
    // TODO
}

// TODO 3: 平方函数，让 apply 调用它
int square(int x) { return x * x; }

int main() {
    int a = 1, b = 2;
    int* pa = &a; int* pb = &b;
    swap_ptr(pa, pb);
    std::cout << "*pa=" << *pa << " *pb=" << *pb << std::endl;  // 期望 2 1
    std::cout << apply(5, square) << std::endl;                  // 期望 25
    return 0;
}
`,
    steps: [
      {
        line: 5,
        title: "1. 二级引用写法",
        explain:
          "int*& 是「指针的引用」。参数是 a/b 这两个 int* 的别名，"
          + "函数里交换它们，外面调用方也能看到。",
        options: [
          { label: "经典三行", code: "int* tmp = a;\n    a = b;\n    b = tmp;" },
          { label: "std::swap", code: "std::swap(a, b);" },
        ],
        match: /int\s*\*\s*tmp\s*=\s*a|std::swap\s*\(\s*a\s*,\s*b\s*\)/,
        hint: "出现交换语句或 std::swap(a, b) 即完成",
      },
      {
        line: 10,
        title: "2. 通过函数指针调用",
        explain:
          "int (*op)(int) 声明一个函数指针，指向「返回 int 接收 int」的函数。"
          + "调它就像调普通函数：op(x) 即可。",
        options: [
          { label: "直接调用", code: "return op(x);" },
          { label: "用解引用", code: "return (*op)(x);" },
        ],
        match: /return\s+op\s*\(|return\s+\(\s*\*\s*op\s*\)/,
        hint: "出现 op(x) 或 (*op)(x) 即完成",
      },
    ],
    pitfalls: [
      "把 'int*& a' 写成 'int** a'（一个是引用一个是指针，不一样）",
      "把 'int (*op)(int)' 写成 'int *op(int)' — 这是声明返回 int* 的函数，不是函数指针",
      "函数指针用前忘了检查 nullptr",
    ],
    stretch: [
      "用 std::function 改写 apply（更现代、更安全）",
      "函数指针数组做状态机",
      "Lambda 表达式 + std::function",
    ],
  },

  {
    id: "stl-advanced",
    title: "第 12 关：STL 进阶 — map / set / algorithm",
    language: "cpp",
    difficulty: "进阶",
    description:
      "map 让你用 key 查 value，set 自动去重，algorithm 头文件有一堆神器。",
    goal: "统计一段文本里每个单词出现次数（map + stringstream）",
    skeleton: `// STL 进阶：map + stringstream + algorithm
#include <iostream>
#include <sstream>
#include <map>
#include <string>
#include <algorithm>

int main() {
    std::string text = "the quick brown fox jumps over the lazy dog the dog";

    // TODO 1: 用 std::map<std::string, int> 统计词频

    // TODO 2: 把所有 count >= 2 的词按字母序打印

    // TODO 3: 用 std::find 找 "fox" 是否出现

    return 0;
}
`,
    steps: [
      {
        line: 13,
        title: "1. 切词 + 计数",
        explain:
          "stringstream 把字符串当输入流 >> 一个 word 就能按空格切。"
          + "map[key]++ 是「有就加 1，没有就初始化为 1」的经典写法。",
        options: [
          { label: "经典写法", code: 'std::map<std::string, int> freq;\n    std::istringstream iss(text);\n    std::string word;\n    while (iss >> word) freq[word]++;' },
          { label: "用 split 函数", code: "auto words = split(text);\n    std::map<std::string, int> freq;\n    for (auto& w : words) ++freq[w];" },
        ],
        match: /freq\s*\[\s*\w+\s*\]\s*\+\+|freq\s*\{[^}]+\}/,
        hint: "出现 freq[xxx]++ 或初始化 freq 即完成",
      },
      {
        line: 16,
        title: "2. 过滤并打印",
        explain:
          "map 默认按 key 升序，所以 range for 就是按字母序遍历。"
          + "范围 for + if 过滤，简洁明了。",
        options: [
          { label: "经典 range for", code: 'for (const auto& [w, c] : freq) {\n        if (c >= 2) std::cout << w << ": " << c << std::endl;\n    }' },
          { label: "传统写法", code: "for (auto it = freq.begin(); it != freq.end(); ++it) {\n        if (it->second >= 2) std::cout << it->first << \": \" << it->second << std::endl;\n    }" },
        ],
        match: /for\s*\(\s*const\s+auto\s*&\s*\[|for\s*\([^)]*freq\.begin/,
        hint: "出现范围 for 或 freq.begin() 字样即完成",
      },
      {
        line: 19,
        title: "3. 查找",
        explain:
          "std::find 在 [first, last) 区间找等于 value 的元素。"
          + "找不到返回 end()，所以比较用 != end()。",
        options: [
          { label: "find 写法", code: 'bool found = std::find(text.begin(), text.end(), "fox") != text.end();\n    std::cout << (found ? "找到" : "没找到") << std::endl;' },
          { label: "string::find", code: 'std::cout << (text.find("fox") != std::string::npos ? "找到" : "没找到") << std::endl;' },
        ],
        match: /std::find\s*\(|text\.find\s*\(/,
        hint: "出现 std::find 或 text.find 即完成",
      },
    ],
    pitfalls: [
      "忘 #include <sstream>",
      "map[key]++ 会默认构造一个值（即使 key 不存在），频繁调用可能略慢",
      "用 unordered_map 替代 map — 哈希表，O(1) 平均但无序",
    ],
    stretch: [
      "用 unordered_map 改写",
      "改成统计中文字符（用 wstring）",
      "用 std::multimap 实现一对多映射",
    ],
  },

  {
    id: "classes-oop",
    title: "第 13 关：类与对象",
    language: "cpp",
    difficulty: "进阶",
    description:
      "C++ 是 C with Classes。class 把数据和操作数据的函数捆在一起。",
    goal: "实现一个 Rectangle 类，含构造函数、area()、perimeter()",
    skeleton: `// 类与对象：封装
#include <iostream>

class Rectangle {
private:
    double width;
    double height;
public:
    // TODO 1: 构造函数（默认 1.0 x 1.0）
    Rectangle(double w = 1.0, double h = 1.0) {
        // TODO
    }
    // TODO 2: 计算面积
    double area() const {
        // TODO
    }
    // TODO 3: 计算周长
    double perimeter() const {
        // TODO
    }
};

int main() {
    Rectangle r1;                       // 默认 1.0 x 1.0
    Rectangle r2(3.0, 4.0);             // 3 x 4
    std::cout << "r2.area() = " << r2.area() << std::endl;          // 期望 12
    std::cout << "r2.perimeter() = " << r2.perimeter() << std::endl; // 期望 14
    return 0;
}
`,
    steps: [
      {
        line: 8,
        title: "1. 构造函数赋值",
        explain:
          "构造函数没有返回类型，函数名就是类名。"
          + "参数带默认值 = 1.0，让无参调用也能编译。",
        options: [
          { label: "成员初始化列表", code: "Rectangle(double w = 1.0, double h = 1.0) : width(w), height(h) {}" },
          { label: "函数体内赋值", code: "Rectangle(double w = 1.0, double h = 1.0) { width = w; height = h; }" },
        ],
        match: /:\s*width\s*\(\s*w\s*\)|width\s*=\s*w/,
        hint: "出现 : width(w) 或 width = w 即完成",
      },
      {
        line: 13,
        title: "2. 计算面积",
        explain:
          "const 修饰成员函数表示「不会修改对象」，const 对象只能调 const 函数。",
        options: [
          { label: "一行实现", code: "return width * height;" },
        ],
        match: /return\s+width\s*\*\s*height/,
        hint: "出现 'return width * height' 即完成",
      },
      {
        line: 17,
        title: "3. 计算周长",
        explain: "周长 = 2 * (宽 + 高)。",
        options: [
          { label: "标准公式", code: "return 2 * (width + height);" },
        ],
        match: /return\s+2\s*\*\s*\(\s*width\s*\+\s*height\s*\)/,
        hint: "出现 'return 2 * (width + height)' 即完成",
      },
    ],
    pitfalls: [
      "构造函数忘记写默认值，导致 Rectangle r; 编译报错",
      "不写 const 修饰只读函数 — const 对象调用会编译失败",
      "忘了 public: / private: — 默认 private，但常用方法放 public",
    ],
    stretch: [
      "加 operator<< 让 std::cout 直接打印",
      "加 is_square() 判定方法",
      "用 struct 重写（成员默认 public）",
    ],
  },

  {
    id: "smart-pointers",
    title: "第 14 关：智能指针",
    language: "cpp",
    difficulty: "进阶",
    description:
      "unique_ptr / shared_ptr 替你管 delete，告别内存泄漏。",
    goal: "用 unique_ptr 管理动态数组，演示所有权转移",
    skeleton: `// 智能指针：unique_ptr / shared_ptr
#include <iostream>
#include <memory>
#include <vector>

int main() {
    // TODO 1: 创建 unique_ptr<int[]> 管理 5 个元素

    // TODO 2: 填值 1..5 并打印

    // TODO 3: std::move 转交所有权给另一个 unique_ptr

    // TODO 4: shared_ptr<int> 共享一个计数指针

    return 0;
}
`,
    steps: [
      {
        line: 9,
        title: "1. 创建 unique_ptr<int[]>",
        explain:
          "unique_ptr<int[]> 专门管数组，用 std::make_unique<int[]>(5) 创建。"
          + "超出作用域自动 delete[]，不用手动释放。",
        options: [
          { label: "make_unique", code: "auto arr = std::make_unique<int[]>(5);" },
          { label: "reset 写法", code: "std::unique_ptr<int[]> arr(new int[5]);" },
        ],
        match: /make_unique\s*<\s*int\s*\[\s*\]\s*>\s*\(\s*5\s*\)|unique_ptr\s*<\s*int\s*\[\s*\]\s*>\s*arr/,
        hint: "出现 make_unique<int[]>(5) 或 unique_ptr<int[]> arr 即完成",
      },
      {
        line: 12,
        title: "2. 填充并打印",
        explain: "智能指针重载了 operator[]，用 arr[i] 像普通数组一样访问。",
        options: [
          { label: "循环填值", code: "for (int i = 0; i < 5; ++i) arr[i] = i + 1;\n    for (int i = 0; i < 5; ++i) std::cout << arr[i] << std::endl;" },
          { label: "范围 for", code: "for (int i = 0; i < 5; ++i) arr[i] = i + 1;\n    for (int i = 0; i < 5; ++i) std::cout << arr[i] << \" \";\n    std::cout << std::endl;" },
        ],
        match: /arr\s*\[\s*\w+\s*\]\s*=/,
        hint: "出现 arr[xx] = 即完成",
      },
      {
        line: 15,
        title: "3. 移动所有权",
        explain:
          "std::move 显式转移所有权。之后原来的 unique_ptr 变成空（nullptr），"
          + "新的接手管理。",
        options: [
          { label: "std::move", code: "auto arr2 = std::move(arr);\n    std::cout << \"arr=\" << (arr ? \"not null\" : \"null\") << std::endl;\n    std::cout << \"arr2[0]=\" << arr2[0] << std::endl;" },
        ],
        match: /std::move\s*\(\s*arr\s*\)/,
        hint: "出现 std::move(arr) 即完成",
      },
      {
        line: 18,
        title: "4. shared_ptr",
        explain:
          "shared_ptr 多个指针共享同一个对象，内部维护引用计数，"
          + "最后一个引用销毁时才 delete。",
        options: [
          { label: "共享指针", code: "auto p1 = std::make_shared<int>(42);\n    std::shared_ptr<int> p2 = p1;\n    std::cout << \"use_count=\" << p1.use_count() << std::endl;  // 期望 2" },
        ],
        match: /make_shared\s*<\s*int\s*>/,
        hint: "出现 make_shared<int> 即完成",
      },
    ],
    pitfalls: [
      "一个 unique_ptr 被两个指针赋值 — 编译错误（禁止拷贝）",
      "shared_ptr 循环引用 — 内存泄漏，用 weak_ptr 打破环",
      "裸指针和 unique_ptr 混用 — 容易双重 delete",
    ],
    stretch: [
      "shared_ptr 循环引用演示 + weak_ptr 解法",
      "自定义删除器（管理 FILE* 等）",
      "用 unique_ptr 实现 pImpl 模式",
    ],
  },

  {
    id: "move-semantics",
    title: "第 15 关：移动语义",
    language: "cpp",
    difficulty: "挑战",
    description:
      "C++11 引入移动语义，让对象的所有权转移像指针一样轻量，不再发生昂贵的拷贝。",
    goal: "写一个简单的 MyString，对比拷贝与移动的性能差距",
    skeleton: `// 移动语义：std::move + 右值引用
#include <iostream>
#include <cstring>

class MyString {
    char* data_;
    std::size_t size_;
public:
    // TODO 1: 普通构造函数
    MyString(const char* s) {
        // TODO
    }
    // TODO 2: 拷贝构造函数
    MyString(const MyString& other) {
        // TODO: 深拷贝
    }
    // TODO 3: 移动构造函数
    MyString(MyString&& other) noexcept {
        // TODO: 偷指针 + 置空源
    }
    ~MyString() { delete[] data_; }

    const char* c_str() const { return data_; }
    std::size_t size() const { return size_; }
};

int main() {
    MyString a("hello");
    MyString b = a;                  // 拷贝
    MyString c = std::move(a);       // 移动
    std::cout << "b=" << b.c_str() << std::endl;  // hello
    std::cout << "c=" << c.c_str() << std::endl;  // hello
    std::cout << "a=" << (a.c_str() ? a.c_str() : "null") << std::endl; // null
    return 0;
}
`,
    steps: [
      {
        line: 8,
        title: "1. 普通构造函数",
        explain:
          "拷贝字符串到堆上。size + 1 是为 '\\0' 留位置。"
          + "std::memcpy 或 std::copy 都行。",
        options: [
          { label: "经典写法", code: "size_ = std::strlen(s);\n        data_ = new char[size_ + 1];\n        std::memcpy(data_, s, size_ + 1);" },
        ],
        match: /data_\s*=\s*new\s+char\s*\[|std::memcpy\s*\(\s*data_/,
        hint: "出现 data_ = new char[...] 或 std::memcpy 即完成",
      },
      {
        line: 13,
        title: "2. 深拷贝",
        explain:
          "拷贝构造要为新对象分配独立内存，否则两个对象共享 data_ 会双重 delete。",
        options: [
          { label: "深拷贝", code: "size_ = other.size_;\n        data_ = new char[size_ + 1];\n        std::memcpy(data_, other.data_, size_ + 1);" },
        ],
        match: /data_\s*=\s*new\s+char\s*\[|std::memcpy\s*\(\s*data_/,
        hint: "出现 data_ = new char[...] 即完成",
      },
      {
        line: 18,
        title: "3. 移动构造（关键）",
        explain:
          "移动 = 「偷」指针。所有权转移到 this，other 置空防止它析构时 delete。"
          + "noexcept 是关键，让 std::vector 等容器在重新分配时放心用移动。",
        options: [
          { label: "标准移动", code: "data_ = other.data_;\n        size_ = other.size_;\n        other.data_ = nullptr;\n        other.size_ = 0;" },
        ],
        match: /other\.data_\s*=\s*nullptr/,
        hint: "出现 other.data_ = nullptr 即完成",
      },
    ],
    pitfalls: [
      "移动构造忘了把源对象置空 — 双重 delete",
      "忘了 noexcept — vector 重新分配时可能退化成拷贝",
      "在移动构造里 std::memcpy 拷贝数据 — 那不是移动",
    ],
    stretch: [
      "加移动赋值运算符 =",
      "用 = default / = delete 让编译器自动生成",
      "对比深拷贝 vs 移动的性能（百万级字符串测试）",
    ],
  },
];
