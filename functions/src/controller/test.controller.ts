import { Route, Controller, Get, OperationId, Security } from 'tsoa';

@Route('test')
export class TestController extends Controller {

   @Get('msg')
   @OperationId('testMsg')
   @Security('api_key')
   public async test(
   ) {
       return 'some test message';
   }

}