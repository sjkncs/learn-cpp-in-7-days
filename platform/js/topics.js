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
];
