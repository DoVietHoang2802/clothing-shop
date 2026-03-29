import requests, json, time

base='https://clothing-shop-api-8wae.onrender.com/api'
report=[]

def rec(name, method, path, status, ok, note='', sample=None):
    report.append({
        'name': name,
        'method': method,
        'path': path,
        'status': status,
        'ok': ok,
        'note': note,
        'sample': sample
    })

admin_email='admin3@gmail.com'
admin_pass='123456'
admin_token=None
user_token=None
user_email=f"apitest_{int(time.time())}@mail.com"
user_pass='Password123@'
user_name='API Test User'

try:
    r=requests.post(f'{base}/auth/login',json={'email':admin_email,'password':admin_pass},timeout=25)
    data=r.json() if 'application/json' in r.headers.get('content-type','') else {}
    if r.status_code==200 and data.get('success'):
        admin_token=data['data']['token']
        rec('Admin login','POST','/auth/login',r.status_code,True,'Đăng nhập admin thành công',{'token':'***'})
    else:
        rec('Admin login','POST','/auth/login',r.status_code,False,data.get('message','login failed'),data)
except Exception as e:
    rec('Admin login','POST','/auth/login',0,False,str(e))

try:
    r=requests.post(f'{base}/auth/register',json={'name':user_name,'email':user_email,'password':user_pass},timeout=25)
    data=r.json() if 'application/json' in r.headers.get('content-type','') else {}
    if r.status_code in (200,201) and data.get('success'):
        user_token=data['data']['token']
        rec('User register','POST','/auth/register',r.status_code,True,'Tạo user test thành công',{'email':user_email})
    else:
        rec('User register','POST','/auth/register',r.status_code,False,data.get('message','register failed'),data)
except Exception as e:
    rec('User register','POST','/auth/register',0,False,str(e))

if not user_token:
    try:
        r=requests.post(f'{base}/auth/login',json={'email':user_email,'password':user_pass},timeout=25)
        data=r.json() if 'application/json' in r.headers.get('content-type','') else {}
        if r.status_code==200 and data.get('success'):
            user_token=data['data']['token']
            rec('User login','POST','/auth/login',r.status_code,True,'Đăng nhập user test thành công',{'email':user_email})
        else:
            rec('User login','POST','/auth/login',r.status_code,False,data.get('message','user login failed'),data)
    except Exception as e:
        rec('User login','POST','/auth/login',0,False,str(e))

if not admin_token:
    print(json.dumps({'fatal':'No admin token','report':report},ensure_ascii=False,indent=2))
    raise SystemExit(0)

H_admin={'Authorization':f'Bearer {admin_token}'}
H_user={'Authorization':f'Bearer {user_token}'} if user_token else {}

for name,m,p in [
    ('Health','GET','/health'),
    ('Get categories','GET','/categories'),
    ('Get products','GET','/products'),
]:
    try:
        r=requests.get(base+p,timeout=25)
        data=r.json() if 'application/json' in r.headers.get('content-type','') else None
        rec(name,m,p,r.status_code,r.status_code<500,'',data if isinstance(data,dict) else None)
    except Exception as e:
        rec(name,m,p,0,False,str(e))

cat_id=None
product_id=None
coupon_id=None
order_id=None

try:
    payload={'name':f'API_CAT_{int(time.time())}','description':'cat for api test'}
    r=requests.post(f'{base}/categories',headers=H_admin,json=payload,timeout=25)
    d=r.json() if 'application/json' in r.headers.get('content-type','') else {}
    if r.status_code in (200,201) and d.get('success'):
        cat_id=d['data']['_id']
        rec('Create category (admin)','POST','/categories',r.status_code,True,'',{'categoryId':cat_id})
    else:
        rec('Create category (admin)','POST','/categories',r.status_code,False,d.get('message','fail'),d)
except Exception as e:
    rec('Create category (admin)','POST','/categories',0,False,str(e))

try:
    payload={
        'name':f'API_PRODUCT_{int(time.time())}',
        'description':'product for api test',
        'price':120000,
        'stock':10,
        'category':cat_id,
        'image':'https://via.placeholder.com/300'
    }
    r=requests.post(f'{base}/products',headers=H_admin,json=payload,timeout=25)
    d=r.json() if 'application/json' in r.headers.get('content-type','') else {}
    if r.status_code in (200,201) and d.get('success'):
        product_id=d['data']['_id']
        rec('Create product (admin)','POST','/products',r.status_code,True,'',{'productId':product_id})
    else:
        rec('Create product (admin)','POST','/products',r.status_code,False,d.get('message','fail'),d)
except Exception as e:
    rec('Create product (admin)','POST','/products',0,False,str(e))

try:
    payload={
        'code':f'API{int(time.time())%100000}',
        'discountType':'PERCENTAGE',
        'discountValue':10,
        'minOrderValue':10000,
        'maxDiscount':50000,
        'usageLimit':20,
        'expiresAt':'2026-12-31'
    }
    r=requests.post(f'{base}/coupons',headers=H_admin,json=payload,timeout=25)
    d=r.json() if 'application/json' in r.headers.get('content-type','') else {}
    if r.status_code in (200,201) and d.get('success'):
        coupon_id=d['data']['_id']
        rec('Create coupon (admin)','POST','/coupons',r.status_code,True,'',{'couponId':coupon_id,'code':d['data'].get('code')})
    else:
        rec('Create coupon (admin)','POST','/coupons',r.status_code,False,d.get('message','fail'),d)
except Exception as e:
    rec('Create coupon (admin)','POST','/coupons',0,False,str(e))

for name,path,headers in [
    ('Get all orders (admin)','/orders',H_admin),
    ('Get admin users','/admin/users',H_admin),
    ('Get profile (user)','/users/profile',H_user if user_token else None),
    ('Get addresses (user)','/addresses',H_user if user_token else None),
    ('Get wishlist (user)','/wishlist',H_user if user_token else None),
    ('Get notifications (user)','/notifications',H_user if user_token else None),
    ('Unread notifications (user)','/notifications/unread-count',H_user if user_token else None),
]:
    if headers is None:
        rec(name,'GET',path,0,False,'Không có token user để test')
        continue
    try:
        r=requests.get(base+path,headers=headers,timeout=25)
        d=r.json() if 'application/json' in r.headers.get('content-type','') else None
        rec(name,'GET',path,r.status_code,r.status_code<500,'',d if isinstance(d,dict) else None)
    except Exception as e:
        rec(name,'GET',path,0,False,str(e))

if user_token:
    try:
        payload={
            'fullName':'API Test User',
            'phone':'0912345678',
            'address':'123 API Street',
            'city':'TPHCM',
            'district':'Quan 1',
            'ward':'Ben Nghe',
            'isDefault':True
        }
        r=requests.post(f'{base}/addresses',headers={**H_user,'Content-Type':'application/json'},json=payload,timeout=25)
        d=r.json() if 'application/json' in r.headers.get('content-type','') else None
        rec('Create address (user)','POST','/addresses',r.status_code,r.status_code<500,'',d if isinstance(d,dict) else None)
    except Exception as e:
        rec('Create address (user)','POST','/addresses',0,False,str(e))

if user_token and product_id:
    try:
        payload={
            'items':[{'productId':product_id,'quantity':1}],
            'shippingAddress':{
                'fullName':'API Test User',
                'phone':'0912345678',
                'address':'123 API Street, Q1, TPHCM'
            },
            'paymentMethod':'COD'
        }
        r=requests.post(f'{base}/orders',headers={**H_user,'Content-Type':'application/json'},json=payload,timeout=25)
        d=r.json() if 'application/json' in r.headers.get('content-type','') else None
        if r.status_code in (200,201) and isinstance(d,dict) and d.get('success'):
            order_id=d['data']['_id']
            rec('Create order COD (user)','POST','/orders',r.status_code,True,'',{'orderId':order_id})
        else:
            rec('Create order COD (user)','POST','/orders',r.status_code,False,d.get('message','fail') if isinstance(d,dict) else 'fail',d if isinstance(d,dict) else None)
    except Exception as e:
        rec('Create order COD (user)','POST','/orders',0,False,str(e))

if user_token and order_id:
    try:
        r=requests.post(f'{base}/momo/create',headers={**H_user,'Content-Type':'application/json'},json={'orderId':order_id},timeout=25)
        d=r.json() if 'application/json' in r.headers.get('content-type','') else None
        ok=(r.status_code in (200,201) and isinstance(d,dict) and d.get('success'))
        rec('Create MoMo payment (user)','POST','/momo/create',r.status_code,ok,d.get('message','') if isinstance(d,dict) else '',d if isinstance(d,dict) else None)
    except Exception as e:
        rec('Create MoMo payment (user)','POST','/momo/create',0,False,str(e))

if user_token and product_id:
    try:
        r=requests.post(f'{base}/reviews',headers={**H_user,'Content-Type':'application/json'},json={'productId':product_id,'rating':5,'comment':'API test review'},timeout=25)
        d=r.json() if 'application/json' in r.headers.get('content-type','') else None
        rec('Create review (user)','POST','/reviews',r.status_code,r.status_code<500,'',d if isinstance(d,dict) else None)
    except Exception as e:
        rec('Create review (user)','POST','/reviews',0,False,str(e))

if product_id:
    try:
        r=requests.get(f'{base}/reviews/product/{product_id}',timeout=25)
        d=r.json() if 'application/json' in r.headers.get('content-type','') else None
        rec('Get reviews by product','GET','/reviews/product/:productId',r.status_code,r.status_code<500,'',d if isinstance(d,dict) else None)
    except Exception as e:
        rec('Get reviews by product','GET','/reviews/product/:productId',0,False,str(e))

if admin_token and order_id:
    for st in ['CONFIRMED','SHIPPED']:
        try:
            r=requests.put(f'{base}/orders/{order_id}/status',headers={**H_admin,'Content-Type':'application/json'},json={'status':st},timeout=25)
            d=r.json() if 'application/json' in r.headers.get('content-type','') else None
            rec(f'Update order status to {st} (admin)','PUT','/orders/:id/status',r.status_code,r.status_code<500,'',d if isinstance(d,dict) else None)
        except Exception as e:
            rec(f'Update order status to {st} (admin)','PUT','/orders/:id/status',0,False,str(e))

if user_token:
    try:
        r=requests.post(f'{base}/categories',headers={**H_user,'Content-Type':'application/json'},json={'name':'FORBIDDEN_TEST'},timeout=25)
        d=r.json() if 'application/json' in r.headers.get('content-type','') else None
        ok=(r.status_code in (401,403))
        rec('Permission test user->admin endpoint','POST','/categories',r.status_code,ok,'Kỳ vọng 401/403',d if isinstance(d,dict) else None)
    except Exception as e:
        rec('Permission test user->admin endpoint','POST','/categories',0,False,str(e))

result={'generatedAt':int(time.time()),'userTestEmail':user_email,'report':report}
with open('d:/DOAN.NNUDM/clothing-shop/api_test_result.json', 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)
print('saved: d:/DOAN.NNUDM/clothing-shop/api_test_result.json')
