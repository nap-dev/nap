import { createRoute, createSomnolenceServer, t } from './'

const example = createSomnolenceServer({
  routes: {
    '/': createRoute({
      method: 'GET',
      response: t.String(),
      handler: () => 'I am root!',
    }),
    helloGet: createRoute({
      method: 'GET',
      query: t.Object({ name: t.String() }),
      response: t.Object({ greeting: t.String() }),
      handler: ({ query: { name } }) => ({ greeting: `Hello, ${name}!` }),
    }),
    helloPost: createRoute({
      method: 'POST',
      body: t.Object({ name: t.String() }),
      response: t.Object({ greeting: t.String() }),
      handler: ({ body: { name } }) => ({ greeting: `Hello, ${name}!` }),
    }),
    parent: {
      '/': createRoute({
        method: 'GET',
        response: t.String(),
        handler: () => 'Parent route',
      }),
      child: {
        '/': createRoute({
          method: 'GET',
          response: t.String(),
          handler: () => 'Child route',
        }),
        grandchild: createRoute({
          method: 'GET',
          response: t.String(),
          handler: () => 'Grandchild route',
        }),
      },
    },
    authorized: createRoute({
      method: 'GET',
      response: t.String(),
      handler: () => 'Authorized route',
      authorizer: ({ req }) =>
        req.headers.get('Authorization') === 'Bearer 1234',
    }),
    lifecycle: createRoute({
      method: 'GET',
      response: t.String(),
      handler: () => 'Lifecycle route',
      onStart: () => console.log('Starting...'),
      onFinish: () => console.log('Finishing...'),
    }),
  },
})

example.start()
