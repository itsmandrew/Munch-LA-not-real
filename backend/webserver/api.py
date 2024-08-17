from ninja import NinjaAPI

api = NinjaAPI()

@api.get('/hello')
def hello(request):
    print(request)
    return "Hello World"

@api.get('/sup')
def hello(request, query):
    print(query)
    return "Sup"