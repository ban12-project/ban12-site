---
title: 'next.js Server Actions 渐进增强表单'
excerpt: '结合 next.js / server action / zod / react-hook-form 创建渐进增强表单'
date: '2025-06-16T06:28:38.837Z'
author:
  name: Coda
  picture: 'https://avatars.githubusercontent.com/u/23135654?v=4'
ogImage:
  url: 'https://ban12.com/api/og?title=blog.ban12.com'
---

在实践 Next.js 技术栈时，写了相当多的表单这篇文章总结一下目前来说解决掉的疑难问题

实现目标：
1. **数据验证：**在浏览器启用 javascript 的情况下浏览器执行用户输入验证，服务器（server action）再次验证；禁用 javascript 的时候使用服务器验证
2. **提交状态：**同步验证错误信息和等待状态

从 shadcn/ui 的 React Hook Form [文档](https://ui.shadcn.com/docs/components/form#usage)说起

```typescript
// components/example-form.tsx

// 省略库的引入

// 定义 zod schema
const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
})

function MyForm() {
  // 1. Define your form.
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
```

shadcn/ui 的示例代码使用的时候发现两个问题：
1. onSubmit 提交数据的时候结合 server action 不能方便的访问提交状态和服务器验证的错误信息。
2. 在禁用 javascript 的时候，表单不会工作

理想的情况下当用户点击 Submit 时候需要禁用提交按钮显示一个*加载中*的效果，提供及时反馈对用户友好，当服务器抛出错误时将有用的信息显示在用户界面上

```typescript
// 定义默认 ActionState
const initialState = { message: '', errors: {} }

const [state, action, pending] = useActionState(createUser, initialState)

const onSubmit: React.ReactEventHandler<
    React.ComponentRef<'button'>
  > = async (e) => {
  // 阻止 button 默认提交行为
  e.preventDefault()

  // await 后面 e.currentTarget 会丢失，保存 e.currentTarget 引用
  const currentTarget = e.currentTarget

  // 使用 react-hook-form 结合 zod 的表单验证
  const isValid = await form.trigger()
  if (!isValid) return

  // 触发表单提交
  // https://developer.mozilla.org/docs/Web/API/HTMLFormElement/requestSubmit
  currentTarget.form?.requestSubmit()
}

...
- <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
+ <form action={action} className="space-y-8">
...
// 服务器验证的错误信息
+ <FormMessage>
+   {state.message !== 'success' ? state.message : ''}
+ </FormMessage>
...
- <Button type="submit">Submit</Button>
+  <Button type="submit" disabled={pending} onClick={onSubmit}>
  Submit
+   {pending && <LoaderCircleIcon className="animate-spin" />}
+ </Button>

在 onSubmit 中手动调用了 `form.trigger()` 来验证表单，你可能在其他地方找到类似这样的代码
```typescript
// https://github.com/react-hook-form/react-hook-form/issues/10391#issuecomment-2153833104
<form
  action={formAction}
  onSubmit={async (e) => {
    if (!form.formState.isValid) {
      e.preventDefault();
      await form.trigger();
      return;
    }

    e.currentTarget?.requestSubmit();
  }}
>
```

这里的 `form.formState.isValid` 不总是实时的状态，一旦用户的输入满足验证模式的时候点击提交可能会导致表单提交需要点击两次提交按钮的情况（第一次`form.formState.isValid` 任然可能是 `false` 即使表单验证通过了，点两次提交按钮才会发起请求）。
所以这里需要手动触发验证，验证动过后结合 requestSubmit 进行提交
react 扩展了 html `<form>` 标签，使得 form 的 action 属性可以调用 Server Action，这就很有趣了，不仅在正常启用 javascript 的浏览器工作，在禁用的时候也可以工作。接下来看看 Server Action 怎么写：

```typescript
// action.ts
'use server'

export async function createUser(prevState: State, formData: FormData) {
  const validatedFields = formSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to validate form data.',
    }
  }

  const { link, id } = validatedFields.data

  try {
    // 查重后写入数据库
  } catch {
    return {
      message: 'Failed to create user.',
    }
  }

  return {
    message: 'success',
  }
}
```

Server Action 返回的信息会在 [useActionState](https://react.dev/reference/react/useActionState) 的第一个返回参数上，可以用来进一步提醒用户发生了什么
