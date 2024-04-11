import redis from 'redis';
import prerenderNode from 'prerender-node';

let client;

export default function prerender(req, res, next) {

    if(!process.env.PRERENDER_SERVICE_URL) 
        return next();

    prerenderNode.blacklisted([]);//'^/paths to ignore'
    prerenderNode.extensionsToIgnore.push('.html');
    prerenderNode.extensionsToIgnore.push('.json');

   if(!prerenderNode.shouldShowPrerenderedPage(req)) 
    return next();


    if(process.env.REDIS_URL){

        if(!client){
            client = redis.createClient(process.env.REDIS_URL);
        }
        
        prerenderNode.set('beforeRender', function(req, done) {
                client.get(req.url, done);
        }).set('afterRender', function(err, req, prerender_res) {
                client.set(req.url, prerender_res.body)
        });


    };

    
    return prerenderNode(req, res, next)

}
