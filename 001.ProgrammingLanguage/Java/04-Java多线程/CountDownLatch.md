CountDownLatch见名思义，即倒计时器，是多线程并发控制中非常有用的工具类，它可以控制线程等待，直到倒计时器归0再继续执行。



给你出个题，控制5个线程执行完后主线徎再往下执行，并统计5个线程的所耗时间。当然我们可以通过join的形式完成这道题，但如果我说统计100个1000个线程呢？难道要写1000个join等待吗？这显然是不现实的。



废话少说，我们来做一个例子看看上面的题怎么实现，并理解倒计时器。



![img](http://mmbiz.qpic.cn/mmbiz_png/TNUwKhV0JpQacGttNmZqyEH0fvic01TXP56uPk9cCibJ4mf07tVycx0kbWaDH6YyA3g142PNdFI6c48bibMd2iaXZg/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

首先通过new CountDownLatch(5)约定了倒计时器的数量，在这里也是线程的数量，每个线程执行完后再对倒计时器-1。countDown()方法即是对倒计时器-1，这个方法需要放在finally中，一定要保证在每个线程中得到释放，不然子线程如果因为某种原因报错倒计时器永远不会清0，则会导报主线程会一直等待。



await()方法即是主线程阻塞等待倒计器归0后再继续往下执行，当然await可以带时间进去，等待多久时间后不管倒计时器有没有归0主线程继续往下执行。



如上面的例子所示，我们输出了倒计时器最后的数字0，表示倒计时器归0了，也输出了从开始到结束所花费的时间。从这个例子可以完全理解倒计时器的含义，这个工具类在实际开发经常有用到，也很好用。