const Router = require('../');
const Koa = require('Koa');
const request = require('supertest');
const should = require('should');

describe('Koa-66', function(){

    it('.routes() should be a valid middleware factory', function(done){
        var router = new Router();
        router.should.have.property('routes');
        router.routes.should.be.type('function');
        var middleware = router.routes();
        should.exist(middleware);
        middleware.should.be.type('function');
        done();
    });

    it('200 with valid path and body', function(done){
        const app = new Koa();
        const router = new Router();

        router.get('/hello', function(ctx){
            ctx.body = 'world'
        });

        app.use(router.routes());

        request(app.listen())
            .get('/hello')
            .expect(200)
            .expect('world')
            .end(done);
    });

    it('200 with complete body and multiple routes', function(done){
        const app = new Koa();
        const router = new Router();

        router.get('/hello', function(ctx, next){
            ctx.body = 'wor'
            next();
        });
        router.get('/hello', function(ctx){
            ctx.body += 'ld'
        });

        app.use(router.routes());

        request(app.listen())
            .get('/hello')
            .expect(200)
            .expect('world')
            .end(done);
    });

    it('multiple routes without next should stop', function(done){
        const app = new Koa();
        const router = new Router();

        router.get('/hello', function(ctx){
            ctx.body = 'wor'
        });
        router.get('/hello', function(ctx){
            ctx.body += 'ld'
        });

        app.use(router.routes());

        request(app.listen())
            .get('/hello')
            .expect(200)
            .expect('wor')
            .end(done);
    });

    it('no routes should return 404', function(done){
        const app = new Koa();
        const router = new Router();

        app.use(router.routes());

        request(app.listen())
            .get('/hello')
            .expect(404)
            .end(done);
    });

    it('only use should not be exec', function(done){
        const app = new Koa();
        const router = new Router();

        router.use('/', function(ctx){
            ctx.body = 'wor'
        });

        app.use(router.routes());

        request(app.listen())
            .get('/')
            .expect(404)
            .end(done);
    });

    it('use without path should be apply to all router object methods', function(done){
        const app = new Koa();
        const router = new Router();

        router.use(function(ctx, next){
            ctx.body = 'wor'
            next();
        });

        router.get('/hello', function(ctx){
            ctx.body += 'ld'
        });

        app.use(router.routes());

        request(app.listen())
            .get('/hello')
            .expect(200)
            .expect('world')
            .end(done);
    });

    it('.mount should 200 with correct path', function(done){
        const app = new Koa();
        const router = new Router();
        const router2 = new Router();

        router.get('/', function(ctx){
            ctx.body = 'world'
        });

        router2.mount('/hello', router)

        app.use(router2.routes());

        request(app.listen())
            .get('/hello')
            .expect(200)
            .expect('world')
            .end(done);
    });

    it('.mount should 404 with old path', function(done){
        const app = new Koa();
        const router = new Router();
        const router2 = new Router();

        router.get('/', function(ctx){
            ctx.body = 'world'
        });

        router2.mount('/hello', router)

        app.use(router2.routes());

        request(app.listen())
            .get('/')
            .expect(404)
            .end(done);
    });

    it('use .mount should be apply only on children', function(done){
        const app = new Koa();
        const router = new Router();
        const router2 = new Router();

        router.use(function(ctx, next){
            ctx.body = 'hello'
            next();
        })

        router.get('/', function(ctx){
            ctx.body += 'world'
        });

        router2.mount('/hello', router)

        app.use(router2.routes());

        request(app.listen())
            .get('/hello')
            .expect(200)
            .expect('helloworld')
            .end(done);
    });

    it('use .mount should be apply only on children 2', function(done){
        const app = new Koa();
        const router = new Router();
        const router2 = new Router();

        router.use(function(ctx, next){
            ctx.body = 'hello'
            next();
        })

        router.get('/', function(ctx){
            ctx.body += 'world'
        });

        router2.get('/', function(ctx){

            ctx.body +='pouet';
        })
        router2.mount('/hello', router)

        app.use(router2.routes());

        request(app.listen())
            .get('/')
            .expect(200)
            .expect('undefinedpouet')
            .end(done);
    });

    it('url params', function(done){
        const app = new Koa();
        const router = new Router();
        const router2 = new Router();

        router.get('/:two/test', function(ctx){
            ctx.body = ctx.params;
        });

        router2.mount('/:one', router)

        app.use(router2.routes());

        request(app.listen())
            .get('/one/two/test')
            .expect(200)
            .expect({one:'one', two: 'two'})
            .end(done);
        });

});
