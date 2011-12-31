require('../src/lib/patch');

describe('monkey patching', function(){
  describe('Date', function(){
    describe('#format()', function(){
      it('should worked', function(){
        var d = new Date('2012-12-20 12:59:59');
        var s;
        console.log(d.format())
        d.format().should.equal('2012-12-20 12:59:59');
        d.format('YYYY').should.equal('2012');
        d.format('YYYY-MM').should.equal('2012-12');
        d.format('YYYY-MM-dd').should.equal('2012-12-20');
        d.format('YYYY-MM-dd hh:mm:ss').should.equal('2012-12-20 12:59:59');
        d.format('YYYY-MM-ddThh:mm:ss').should.equal('2012-12-20T12:59:59');
        d.format('YYYYMMddhhmmss').should.equal('20121220125959');
      })
    })
  })

  describe('String', function(){
    it('#trim()', function(){
      var s = "\n\r  a  d \r\n";
      s.trim().should.equal('a  d');
    })
  })
})