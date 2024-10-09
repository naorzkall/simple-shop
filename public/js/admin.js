const deleteProduct = (btn)=>{
    const prodId = btn.parentNode.querySelector('[name=productId]').value;
    const productElement = btn.closest('article');
    console.log(btn);
    console.log(productElement);
    fetch('/admin/product/'+prodId,{
        method:'DELETE',
        // headers:{}
    }).then(result=>{
        console.log('gg');
        return result.json();
    }).then( data =>{
        // console.log(data);
        // productElement.remove();
        productElement.parentNode.removeChild(productElement);

    })
    .catch(err=>{
        console.log(err);
    });
}