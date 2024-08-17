from ninja import NinjaAPI

api = NinjaAPI()

@api.get('/hello')
def hello(request):
    print(request)
    return "Hello World"